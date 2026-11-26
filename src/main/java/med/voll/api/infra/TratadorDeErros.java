package med.voll.api.infra;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tools.jackson.core.JacksonException;

import java.sql.SQLException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

// Um tratador só para todos os domínios (médicos e clientes): as mensagens daqui não citam nenhum deles
@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Void> tratarErro404() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<DadosErroCampo>> tratarErroDeValidacao(MethodArgumentNotValidException excecao) {
        var erros = excecao.getFieldErrors().stream().map(DadosErroCampo::new).toList();
        return ResponseEntity.badRequest().body(erros);
    }

    // JSON que nem chega a virar DTO: data "31/02/1990", especialidade inexistente, texto em campo numérico
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<List<DadosErroCampo>> tratarCorpoIlegivel(HttpMessageNotReadableException excecao) {
        var campo = campoDoErroDeLeitura(excecao);
        var mensagem = campo == null ? "Corpo da requisição inválido." : "formato inválido";
        return ResponseEntity.badRequest().body(List.of(new DadosErroCampo(campo, mensagem)));
    }

    // Junta o caminho do Jackson no mesmo formato dos erros de validação, ex.: "endereco.cep"
    private String campoDoErroDeLeitura(HttpMessageNotReadableException excecao) {
        if (!(excecao.getMostSpecificCause() instanceof JacksonException jackson) || jackson.getPath().isEmpty()) {
            return null;
        }
        var caminho = jackson.getPath().stream()
                .map(JacksonException.Reference::getPropertyName)
                .filter(Objects::nonNull)
                .collect(Collectors.joining("."));
        return caminho.isEmpty() ? null : caminho;
    }

    @ExceptionHandler(CadastroDuplicadoException.class)
    public ResponseEntity<List<DadosErroCampo>> tratarCadastroDuplicado(CadastroDuplicadoException excecao) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(List.of(new DadosErroCampo(excecao.getCampo(), excecao.getMessage())));
    }

    // Rede de segurança: dois cadastros simultâneos podem passar pela checagem do Service
    // e só esbarrar na constraint unique do banco. Outras violações (ex.: valor maior que a coluna)
    // não são duplicidade e não podem virar a mensagem de "já existe"
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<List<DadosErroCampo>> tratarViolacaoDeIntegridade(DataIntegrityViolationException excecao) {
        if (ehViolacaoDeUnicidade(excecao)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(List.of(new DadosErroCampo(null, "Já existe um cadastro com estes dados.")));
        }
        return ResponseEntity.badRequest()
                .body(List.of(new DadosErroCampo(null, "O banco recusou algum dado. Revise os campos e tente de novo.")));
    }

    // 23505: unique violation no PostgreSQL e no H2. 1062: duplicate entry no MySQL
    private boolean ehViolacaoDeUnicidade(DataIntegrityViolationException excecao) {
        return excecao.getMostSpecificCause() instanceof SQLException sql
                && ("23505".equals(sql.getSQLState()) || sql.getErrorCode() == 1062);
    }

    @ExceptionHandler({PropertyReferenceException.class, InvalidDataAccessApiUsageException.class})
    public ResponseEntity<DadosErro> tratarErroOrdenacao() {
        return ResponseEntity.badRequest()
                .body(new DadosErro("Parâmetro sort inválido. Use um campo da listagem, por exemplo: nome ou nome,desc"));
    }

    public record DadosErro(String mensagem) {
    }

    public record DadosErroCampo(String campo, String mensagem) {
        public DadosErroCampo(FieldError erro) {
            this(erro.getField(), erro.getDefaultMessage());
        }
    }
}
