package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// "import static" traz os métodos de verificação (assertEquals, assertTrue...)
// para você usar direto, sem escrever Assertions.assertEquals toda vez
import static org.junit.jupiter.api.Assertions.*;


class MedicoTest {

    // Ajudante (massa de teste): monta um endereço válido.
    // A ordem dos campos é a MESMA do record DadosEndereco:
    // logradouro, bairro, cep, cidade, uf, complemento, numero
    private DadosEndereco enderecoValido() {
        return new DadosEndereco("Rua das Flores", "Centro", "87000000",
                "Maringá", "PR", null, "100");
    }

    // Ajudante (massa de teste): monta o "formulário de cadastro" completo.
    // Ordem do record DadosCadastroMedico:
    // nome, email, telefone, crm, especialidade, endereco
    private DadosCadastroMedico cadastroValido() {
        return new DadosCadastroMedico("Ana Souza", "ana@voll.med", "44999990000",
                "123456", Especialidade.CARDIOLOGIA, enderecoValido());
    }
    @Test
    @DisplayName("Cenário: ao cadastrar, o médico nasce ATIVO")
    void deveCriarMedicoAtivoAoCadastrar() {
        // Arrange + Act: crio o médico a partir do formulário
        Medico medico = new Medico(cadastroValido());

        // Assert: verifico o que o construtor deveria ter feito
        assertTrue(medico.getAtivo());                      // nasceu ativo?
        assertEquals("Ana Souza", medico.getNome());        // copiou o nome?
        assertEquals("Maringá", medico.getEndereco().getCidade()); // montou o endereço?
    }

    @Test
    @DisplayName("Cenário: excluir NÃO apaga, só marca como inativo (exclusão lógica)")
    void deveInativarMedicoAoExcluir() {
        // Arrange
        Medico medico = new Medico(cadastroValido());

        // Act
        medico.excluir();

        // Assert
        assertFalse(medico.getAtivo());
    }

    @Test
    @DisplayName("Cenário: atualização PARCIAL, só o nome muda e o resto fica igual")
    void deveAtualizarApenasONomeQuandoSoONomeForInformado() {
        Medico medico = new Medico(cadastroValido());

        // Formulário de atualização: id, nome, telefone, endereco
        // null = "não quero mudar este campo"
        var dados = new DadosAtualizacaoMedico(1L, "Ana Lima", null, null);

        medico.atualizarInformacoes(dados);

        assertEquals("Ana Lima", medico.getNome());               // mudou
        assertEquals("44999990000", medico.getTelefone());        // NÃO mudou
        assertEquals("Maringá", medico.getEndereco().getCidade()); // NÃO mudou
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

        // assertThrows(TIPO da exceção esperada, CÓDIGO que deve lançá-la)
        // O "() -> ..." é uma lambda: um pedaço de código "embrulhado"
        // que o assertThrows executa e observa. Se a exceção NÃO acontecer,
        // o teste falha.
        assertThrows(NullPointerException.class,
                () -> medico.atualizarInformacoes(null));
    }

    @Test
    @DisplayName("Este teste documenta o comportamento ATUAL (que provavelmente está errado).")
    void aceitaNomeVazioNaAtualizacao() {
        Medico medico = new Medico(cadastroValido());

        medico.atualizarInformacoes(new DadosAtualizacaoMedico(1L, "", null, null));

        assertEquals("", medico.getNome()); // o médico ficou SEM nome!
    }

    @Test
    @DisplayName("Cenário: atualizar só a cidade do endereço. A cidade muda, e o logradouro, o bairro e o CEP continuam iguais.")
    void deveAtualizarApenasACidadeDoEnderecoDoMedico() {
        Medico medico = new Medico(cadastroValido());

        // Formulário de atualização: logradouro, bairro, cep, cidade, uf, complemento e numero
        // null = "não quero mudar este campo"
        var novoEndereco = new DadosEndereco(null, null, null, "Cianorte", null, null, null);

        medico.atualizarInformacoes(new DadosAtualizacaoMedico(1L, null, null, novoEndereco));

        assertAll(
                () -> assertEquals("Cianorte", medico.getEndereco().getCidade()),           // mudou
                () -> assertEquals("Rua das Flores", medico.getEndereco().getLogradouro()), //NÃO mudou
                () -> assertEquals("Centro", medico.getEndereco().getBairro()),             //NÃO mudou
                () -> assertEquals("87000000", medico.getEndereco().getCep()),              //NÃO mudou
                () -> assertEquals("PR", medico.getEndereco().getUf()),                     //NÃO mudou
                () -> assertEquals("100", medico.getEndereco().getNumero()),                //NÃO mudou
                () -> assertNull(medico.getEndereco().getComplemento())                             //NÃO mudou (continua sem)
        );
    }

    @Test
    @DisplayName("Deve reativar um médico que foi excluído logicamente")
    void deveReativarMedicoInativo() {
        // ARRANGE: crio um médico e excluo (fica inativo)
        Medico medico = new Medico(cadastroValido());
        medico.excluir();
        assertFalse(medico.getAtivo());   // garanto o ponto de partida: inativo

        // ACT
        medico.ativar();

        // ASSERT
        assertTrue(medico.getAtivo());
    }

    @Test
    @DisplayName("Ativar um médico que já está ativo mantém ele ativo")
    void deveManterAtivoAoAtivarMedicoJaAtivo() {
        Medico medico = new Medico(cadastroValido());   // já nasce ativo

        medico.ativar();

        assertTrue(medico.getAtivo());
    }
}