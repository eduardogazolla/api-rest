package med.voll.api.infra;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// "Spring, esta classe vigia TODOS os controllers.
// Se algum deles deixar escapar uma exceção, passe por aqui."
@RestControllerAdvice
public class TratadorDeErros {

    // "Quando escapar uma EntityNotFoundException, responda 404"
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Void> tratarErro404() {
        return ResponseEntity.notFound().build();
    }
}