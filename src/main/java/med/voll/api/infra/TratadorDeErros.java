package med.voll.api.infra;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
