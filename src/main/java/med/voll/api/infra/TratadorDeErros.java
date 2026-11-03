package med.voll.api.infra;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Void> tratarErro404() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler({PropertyReferenceException.class, InvalidDataAccessApiUsageException.class})
    public ResponseEntity<DadosErro> tratarErroOrdenacao() {
        return ResponseEntity.badRequest()
                .body(new DadosErro("Parâmetro sort inválido. Use uma propriedade do médico, por exemplo: nome ou crm,desc"));
    }

    public record DadosErro(String mensagem) {
    }
}