package med.voll.api.cliente;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

import static med.voll.api.cliente.ClientesDeTeste.endereco;
import static med.voll.api.cliente.ClientesDeTeste.novoEmail;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DadosCadastroClienteTest {

    private static Validator validator;

    @BeforeAll
    static void criarValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private DadosCadastroCliente cadastro(String nome, String cpf, LocalDate nascimento) {
        return new DadosCadastroCliente(nome, novoEmail(), "44999998888", cpf, nascimento, endereco());
    }

    private Set<String> mensagensDoCampo(DadosCadastroCliente dados, String campo) {
        Set<ConstraintViolation<DadosCadastroCliente>> erros = validator.validate(dados);
        return erros.stream()
                .filter(erro -> erro.getPropertyPath().toString().equals(campo))
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.toSet());
    }

    @Test
    @DisplayName("Deve aceitar um cadastro válido")
    void deveAceitarCadastroValido() {
        assertTrue(validator.validate(ClientesDeTeste.cadastroValido()).isEmpty());
    }

    @Test
    @DisplayName("Deve recusar CPF com 10 dígitos")
    void deveRecusarCpfComDezDigitos() {
        var dados = cadastro("Beatriz Rocha", "5299822472", LocalDate.of(1990, 5, 20));

        assertTrue(mensagensDoCampo(dados, "cpf").contains("deve ter 11 dígitos, sem pontuação"));
    }

    @Test
    @DisplayName("Deve recusar CPF com pontuação, mesmo com dígitos válidos")
    void deveRecusarCpfComPontuacao() {
        var dados = cadastro("Beatriz Rocha", "529.982.247-25", LocalDate.of(1990, 5, 20));

        assertEquals(Set.of("deve ter 11 dígitos, sem pontuação"), mensagensDoCampo(dados, "cpf"));
    }

    @Test
    @DisplayName("Deve recusar CPF com dígito verificador inválido")
    void deveRecusarCpfComDigitoVerificadorInvalido() {
        var dados = cadastro("Beatriz Rocha", "52998224724", LocalDate.of(1990, 5, 20));

        assertEquals(Set.of("CPF inválido"), mensagensDoCampo(dados, "cpf"));
    }

    @Test
    @DisplayName("Deve recusar data de nascimento no futuro")
    void deveRecusarDataDeNascimentoNoFuturo() {
        var dados = cadastro("Beatriz Rocha", ClientesDeTeste.novoCpf(), LocalDate.now().plusDays(1));

        assertEquals(Set.of("deve ser uma data no passado"), mensagensDoCampo(dados, "dataNascimento"));
    }

    @Test
    @DisplayName("Deve recusar data de nascimento igual a hoje")
    void deveRecusarDataDeNascimentoHoje() {
        var dados = cadastro("Beatriz Rocha", ClientesDeTeste.novoCpf(), LocalDate.now());

        assertEquals(Set.of("deve ser uma data no passado"), mensagensDoCampo(dados, "dataNascimento"));
    }

    @Test
    @DisplayName("Deve recusar nome com mais de 100 caracteres")
    void deveRecusarNomeComMaisDeCemCaracteres() {
        var dados = cadastro("A".repeat(101), ClientesDeTeste.novoCpf(), LocalDate.of(1990, 5, 20));

        assertEquals(Set.of("deve ter no máximo 100 caracteres"), mensagensDoCampo(dados, "nome"));
    }
}
