package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class TratadorDeErrosTest {

    @Test
    @DisplayName("Deve retornar 409 sem campo quando o banco recusar por integridade (corrida entre checagem e insert)")
    void deveRetornar409SemCampoQuandoHouverViolacaoDeIntegridade() {
        var resposta = new TratadorDeErros()
                .tratarViolacaoDeIntegridade(new DataIntegrityViolationException("unique"));

        assertEquals(HttpStatus.CONFLICT, resposta.getStatusCode());
        var erro = resposta.getBody().get(0);
        assertNull(erro.campo());
        assertEquals("Já existe um médico com estes dados.", erro.mensagem());
    }
}
