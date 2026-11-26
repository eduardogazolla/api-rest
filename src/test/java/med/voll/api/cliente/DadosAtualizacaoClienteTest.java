package med.voll.api.cliente;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DadosAtualizacaoClienteTest {

    private static Validator validator;

    @BeforeAll
    static void criarValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private String unicoErro(DadosAtualizacaoCliente dados) {
        var erros = validator.validate(dados);
        assertEquals(1, erros.size());
        ConstraintViolation<DadosAtualizacaoCliente> erro = erros.iterator().next();
        return erro.getPropertyPath() + ": " + erro.getMessage();
    }

    @Test
    @DisplayName("Deve aceitar campos nulos, porque nulo significa não alterar")
    void deveAceitarCamposNulos() {
        assertTrue(validator.validate(new DadosAtualizacaoCliente(1L, null, null, null)).isEmpty());
    }

    @Test
    @DisplayName("Deve recusar nome em branco")
    void deveRecusarNomeEmBranco() {
        assertEquals("nome: não pode ficar em branco", unicoErro(new DadosAtualizacaoCliente(1L, "  ", null, null)));
    }

    @Test
    @DisplayName("Deve recusar telefone em branco")
    void deveRecusarTelefoneEmBranco() {
        assertEquals("telefone: não pode ficar em branco", unicoErro(new DadosAtualizacaoCliente(1L, null, "", null)));
    }

    @Test
    @DisplayName("Deve recusar atualização sem id")
    void deveRecusarIdAusente() {
        assertEquals("id: é obrigatório", unicoErro(new DadosAtualizacaoCliente(null, "Beatriz", null, null)));
    }
}
