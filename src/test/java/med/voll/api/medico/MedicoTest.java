package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;


class MedicoTest {

    private DadosEndereco enderecoValido() {
        return new DadosEndereco("Rua das Flores", "Centro", "87000000",
                "Maringá", "PR", null, "100");
    }

    private DadosCadastroMedico cadastroValido() {
        return new DadosCadastroMedico("Ana Souza", "ana@voll.med", "44999990000",
                "123456", Especialidade.CARDIOLOGIA, enderecoValido());
    }
    @Test
    @DisplayName("Cenário: ao cadastrar, o médico nasce ATIVO")
    void deveCriarMedicoAtivoAoCadastrar() {
        Medico medico = new Medico(cadastroValido());

        assertTrue(medico.getAtivo());
        assertEquals("Ana Souza", medico.getNome());
        assertEquals("Maringá", medico.getEndereco().getCidade());
    }

    @Test
    @DisplayName("Cenário: excluir NÃO apaga, só marca como inativo (exclusão lógica)")
    void deveInativarMedicoAoExcluir() {
        Medico medico = new Medico(cadastroValido());

        medico.excluir();

        assertFalse(medico.getAtivo());
    }

    @Test
    @DisplayName("Cenário: atualização PARCIAL, só o nome muda e o resto fica igual")
    void deveAtualizarApenasONomeQuandoSoONomeForInformado() {
        Medico medico = new Medico(cadastroValido());

        var dados = new DadosAtualizacaoMedico(1L, "Ana Lima", null, null);

        medico.atualizarInformacoes(dados);

        assertEquals("Ana Lima", medico.getNome());
        assertEquals("44999990000", medico.getTelefone());
        assertEquals("Maringá", medico.getEndereco().getCidade());
    }

    @Test
    @DisplayName("Edge case: tudo nulo, nada deve mudar")
    void naoDeveAlterarNadaQuandoTodosOsCamposForemNulos() {
        Medico medico = new Medico(cadastroValido());

        medico.atualizarInformacoes(new DadosAtualizacaoMedico(1L, null, null, null));

        assertEquals("Ana Souza", medico.getNome());
        assertEquals("44999990000", medico.getTelefone());
    }

    @Test
    @DisplayName("Cenário de exceção: passar o formulário inteiro como null")
    void deveLancarExcecaoQuandoDadosDeAtualizacaoForemNulos() {
        Medico medico = new Medico(cadastroValido());

        assertThrows(NullPointerException.class,
                () -> medico.atualizarInformacoes(null));
    }

    @Test
    @DisplayName("Este teste documenta o comportamento ATUAL (que provavelmente está errado).")
    void aceitaNomeVazioNaAtualizacao() {
        Medico medico = new Medico(cadastroValido());

        medico.atualizarInformacoes(new DadosAtualizacaoMedico(1L, "", null, null));

        assertEquals("", medico.getNome());
    }

    @Test
    @DisplayName("Cenário: atualizar só a cidade do endereço. A cidade muda, e o logradouro, o bairro e o CEP continuam iguais.")
    void deveAtualizarApenasACidadeDoEnderecoDoMedico() {
        Medico medico = new Medico(cadastroValido());

        var novoEndereco = new DadosEndereco(null, null, null, "Cianorte", null, null, null);

        medico.atualizarInformacoes(new DadosAtualizacaoMedico(1L, null, null, novoEndereco));

        assertAll(
                () -> assertEquals("Cianorte", medico.getEndereco().getCidade()),
                () -> assertEquals("Rua das Flores", medico.getEndereco().getLogradouro()),
                () -> assertEquals("Centro", medico.getEndereco().getBairro()),
                () -> assertEquals("87000000", medico.getEndereco().getCep()),
                () -> assertEquals("PR", medico.getEndereco().getUf()),
                () -> assertEquals("100", medico.getEndereco().getNumero()),
                () -> assertNull(medico.getEndereco().getComplemento())
        );
    }

    @Test
    @DisplayName("Deve reativar um médico que foi excluído logicamente")
    void deveReativarMedicoInativo() {
        Medico medico = new Medico(cadastroValido());
        medico.excluir();
        assertFalse(medico.getAtivo());

        medico.ativar();

        assertTrue(medico.getAtivo());
    }

    @Test
    @DisplayName("Ativar um médico que já está ativo mantém ele ativo")
    void deveManterAtivoAoAtivarMedicoJaAtivo() {
        Medico medico = new Medico(cadastroValido());

        medico.ativar();

        assertTrue(medico.getAtivo());
    }
}