package med.voll.api.medico;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DadosAtualizacaoMedicoTest {

    private static Validator validator;

    @BeforeAll
    static void criarValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    @DisplayName("Deve recusar nome vazio na atualização")
    void deveRecusarNomeVazio() {
        var dados = new DadosAtualizacaoMedico(1L, "", null, null);

        var erros = validator.validate(dados);

        assertFalse(erros.isEmpty());
    }

    @Test
    @DisplayName("Deve recusar nome só com espaços na atualização")
    void deveRecusarNomeSoComEspacos() {
        var dados = new DadosAtualizacaoMedico(1L, "   ", null, null);

        var erros = validator.validate(dados);

        assertFalse(erros.isEmpty());
    }

    @Test
    @DisplayName("Deve aceitar nome nulo, que significa não alterar o nome")
    void deveAceitarNomeNulo() {
        var dados = new DadosAtualizacaoMedico(1L, null, null, null);

        var erros = validator.validate(dados);

        assertTrue(erros.isEmpty());
    }

    @Test
    @DisplayName("Deve aceitar nome preenchido")
    void deveAceitarNomePreenchido() {
        var dados = new DadosAtualizacaoMedico(1L, "Ana Lima", null, null);

        var erros = validator.validate(dados);

        assertTrue(erros.isEmpty());
    }

    @Test
    @DisplayName("Deve recusar telefone vazio na atualização")
    void deveRecusarTelefoneVazio() {
        var dados = new DadosAtualizacaoMedico(1L, null, "", null);

        var erros = validator.validate(dados);

        assertFalse(erros.isEmpty());
    }

    @Test
    @DisplayName("Deve recusar telefone só com espaços na atualização")
    void deveRecusarTelefoneSoComEspacos() {
        var dados = new DadosAtualizacaoMedico(1L, null, "   ", null);

        var erros = validator.validate(dados);

        assertFalse(erros.isEmpty());
    }

    @Test
    @DisplayName("Deve aceitar telefone preenchido")
    void deveAceitarTelefonePreenchido() {
        var dados = new DadosAtualizacaoMedico(1L, null, "44988887777", null);

        var erros = validator.validate(dados);

        assertTrue(erros.isEmpty());
    }
}
