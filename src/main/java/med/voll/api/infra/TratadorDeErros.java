package med.voll.api.infra;

import jakarta.persistence.EntityNotFoundException;
import med.voll.api.medico.CadastroDuplicadoException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;
import java.util.List;

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
                    .body(List.of(new DadosErroCampo(null, "Já existe um médico com estes dados.")));
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
                .body(new DadosErro("Parâmetro sort inválido. Use uma propriedade do médico, por exemplo: nome ou crm,desc"));
    }

    public record DadosErro(String mensagem) {
    }

    public record DadosErroCampo(String campo, String mensagem) {
        public DadosErroCampo(FieldError erro) {
            this(erro.getField(), erro.getDefaultMessage());
        }
    }
}
