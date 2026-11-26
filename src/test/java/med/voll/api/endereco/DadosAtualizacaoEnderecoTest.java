package med.voll.api.endereco;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DadosAtualizacaoEnderecoTest {

    private static Validator validator;

    @BeforeAll
    static void criarValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    @DisplayName("Deve aceitar todos os campos nulos, porque nulo significa não alterar")
    void deveAceitarTodosOsCamposNulos() {
        var dados = new DadosAtualizacaoEndereco(null, null, null, null, null, null, null);

        assertTrue(validator.validate(dados).isEmpty());
    }

    @Test
    @DisplayName("Deve recusar logradouro em branco")
    void deveRecusarLogradouroEmBranco() {
        var dados = new DadosAtualizacaoEndereco("  ", null, null, null, null, null, null);

        var erros = validator.validate(dados);

        assertEquals(1, erros.size());
        assertEquals("não pode ficar em branco", erros.iterator().next().getMessage());
    }

    @Test
    @DisplayName("Deve recusar CEP com menos de oito dígitos")
    void deveRecusarCepComMenosDeOitoDigitos() {
        var dados = new DadosAtualizacaoEndereco(null, null, "8700", null, null, null, null);

        var erros = validator.validate(dados);

        assertEquals(1, erros.size());
        assertEquals("deve ter 8 dígitos, sem traço", erros.iterator().next().getMessage());
    }

    @Test
    @DisplayName("Deve aceitar complemento vazio, que apaga o valor atual")
    void deveAceitarComplementoVazio() {
        var dados = new DadosAtualizacaoEndereco(null, null, null, null, null, "", "");

        assertTrue(validator.validate(dados).isEmpty());
    }
}
