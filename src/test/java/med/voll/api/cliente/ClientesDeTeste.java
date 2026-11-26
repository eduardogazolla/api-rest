package med.voll.api.cliente;

import med.voll.api.endereco.DadosEndereco;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

// Fixtures dos testes de cliente. O H2 é compartilhado entre as classes de teste,
// então cada cadastro ganha CPF e e-mail próprios para não esbarrar no unique
final class ClientesDeTeste {

    private static final AtomicLong SEQUENCIA = new AtomicLong(300_000_000L);

    private ClientesDeTeste() {
    }

    static String novoCpf() {
        var digitos = String.valueOf(SEQUENCIA.incrementAndGet());
        var primeiro = digitoVerificador(digitos);
        return digitos + primeiro + digitoVerificador(digitos + primeiro);
    }

    static String novoEmail() {
        return "cliente" + SEQUENCIA.incrementAndGet() + "@teste.voll.med";
    }

    static DadosEndereco endereco() {
        return new DadosEndereco("Av. Brasil", "Centro", "87013000", "Maringá", "PR", "Sala 3", "100");
    }

    static DadosCadastroCliente cadastro(String cpf, String email) {
        return new DadosCadastroCliente("Beatriz Rocha", email, "44999998888", cpf,
                LocalDate.of(1990, 5, 20), endereco());
    }

    static DadosCadastroCliente cadastroValido() {
        return cadastro(novoCpf(), novoEmail());
    }

    static String json(String cpf, String email, String dataNascimento) {
        return """
                {"nome":"Beatriz Rocha","email":"%s","telefone":"44999998888","cpf":"%s","dataNascimento":"%s",
                 "endereco":{"logradouro":"Av. Brasil","bairro":"Centro","cep":"87013000","cidade":"Maringá",
                             "uf":"PR","complemento":"Sala 3","numero":"100"}}
                """.formatted(email, cpf, dataNascimento);
    }

    private static int digitoVerificador(String base) {
        var soma = 0;
        for (var i = 0; i < base.length(); i++) {
            soma += Character.getNumericValue(base.charAt(i)) * (base.length() + 1 - i);
        }
        var resto = (soma * 10) % 11;
        return resto == 10 ? 0 : resto;
    }
}
