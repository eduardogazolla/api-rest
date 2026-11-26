package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class TratadorDeErrosTest {

    private final TratadorDeErros tratador = new TratadorDeErros();

    private DataIntegrityViolationException violacao(String sqlState, int codigo) {
        return new DataIntegrityViolationException("erro do banco", new SQLException("erro", sqlState, codigo));
    }

    @Test
    @DisplayName("Deve retornar 409 quando o banco recusar por unicidade no PostgreSQL ou H2 (SQLState 23505)")
    void deveRetornar409QuandoViolacaoForDeUnicidadeNoPostgres() {
        var resposta = tratador.tratarViolacaoDeIntegridade(violacao("23505", 0));

        assertEquals(HttpStatus.CONFLICT, resposta.getStatusCode());
        var erro = resposta.getBody().get(0);
        assertNull(erro.campo());
        assertEquals("Já existe um médico com estes dados.", erro.mensagem());
    }

    @Test
    @DisplayName("Deve retornar 409 quando o banco recusar por unicidade no MySQL (código 1062)")
    void deveRetornar409QuandoViolacaoForDeUnicidadeNoMysql() {
        var resposta = tratador.tratarViolacaoDeIntegridade(violacao("23000", 1062));

        assertEquals(HttpStatus.CONFLICT, resposta.getStatusCode());
    }

    @Test
    @DisplayName("Deve retornar 400, e não 409 de duplicidade, quando a violação não for de unicidade")
    void deveRetornar400QuandoViolacaoNaoForDeUnicidade() {
        var resposta = tratador.tratarViolacaoDeIntegridade(violacao("22001", 1406));

        assertEquals(HttpStatus.BAD_REQUEST, resposta.getStatusCode());
        assertEquals("O banco recusou algum dado. Revise os campos e tente de novo.", resposta.getBody().get(0).mensagem());
    }
}
