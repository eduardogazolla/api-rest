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
    @DisplayName("Atualização parcial: só o telefone muda e o resto fica igual")
    void deveAtualizarApenasOTelefoneQuandoSoOTelefoneForInformado() {
        var cliente = new Cliente(ClientesDeTeste.cadastroValido());

        cliente.atualizarInformacoes(new DadosAtualizacaoCliente(1L, null, "44911112222", null));

        assertEquals("44911112222", cliente.getTelefone());
        assertEquals("Beatriz Rocha", cliente.getNome());
        assertEquals("Maringá", cliente.getEndereco().getCidade());
    }

    @Test
    @DisplayName("Edge case: tudo nulo, nada deve mudar")
    void naoDeveAlterarNadaQuandoTodosOsCamposForemNulos() {
        var cliente = new Cliente(ClientesDeTeste.cadastroValido());

        cliente.atualizarInformacoes(new DadosAtualizacaoCliente(1L, null, null, null));

        assertEquals("Beatriz Rocha", cliente.getNome());
        assertEquals("44999998888", cliente.getTelefone());
        assertEquals("Sala 3", cliente.getEndereco().getComplemento());
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
