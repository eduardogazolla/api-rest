package med.voll.api.cliente;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClienteTest {

    @Test
    @DisplayName("Ao cadastrar, o cliente nasce ativo e com todos os dados")
    void deveCriarClienteAtivoAoCadastrar() {
        var dados = ClientesDeTeste.cadastroValido();

        var cliente = new Cliente(dados);

        assertTrue(cliente.getAtivo());
        assertEquals(dados.cpf(), cliente.getCpf());
        assertEquals(dados.dataNascimento(), cliente.getDataNascimento());
        assertEquals("Maringá", cliente.getEndereco().getCidade());
    }

    @Test
    @DisplayName("Excluir não apaga, só marca como inativo (exclusão lógica)")
    void deveInativarClienteAoExcluir() {
        var cliente = new Cliente(ClientesDeTeste.cadastroValido());

        cliente.excluir();

        assertFalse(cliente.getAtivo());
    }

    @Test
    @DisplayName("Reativar devolve o cliente inativo para os ativos")
    void deveReativarClienteInativo() {
        var cliente = new Cliente(ClientesDeTeste.cadastroValido());
        cliente.excluir();

        cliente.ativar();

        assertTrue(cliente.getAtivo());
    }
}
