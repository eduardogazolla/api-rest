package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;
import med.voll.api.endereco.Endereco;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

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

    // os testes vêm aqui embaixo
    // Cenário: ao cadastrar, o médico nasce ATIVO
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

    // Cenário: excluir NÃO apaga, só marca como inativo (exclusão lógica)
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

    // Cenário: atualização PARCIAL, só o nome muda e o resto fica igual
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

    // Edge case: tudo nulo, nada deve mudar
    @Test
    @DisplayName("Edge case: tudo nulo, nada deve mudar")
    void naoDeveAlterarNadaQuandoTodosOsCamposForemNulos() {
        Medico medico = new Medico(cadastroValido());

        medico.atualizarInformacoes(new DadosAtualizacaoMedico(1L, null, null, null));

        assertEquals("Ana Souza", medico.getNome());
        assertEquals("44999990000", medico.getTelefone());
    }

    // Cenário de exceção: passar o formulário inteiro como null
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

    // ACHADO: a atualização aceita nome vazio e sobrescreve o nome atual.
    // Este teste documenta o comportamento ATUAL (que provavelmente está errado).
    @Test
    @DisplayName("Este teste documenta o comportamento ATUAL (que provavelmente está errado).")
    void aceitaNomeVazioNaAtualizacao() {
        Medico medico = new Medico(cadastroValido());

        medico.atualizarInformacoes(new DadosAtualizacaoMedico(1L, "", null, null));

        assertEquals("", medico.getNome()); // o médico ficou SEM nome!
    }

    // Cenário: atualizar só a cidade do endereço. A cidade muda, e o logradouro, o bairro e o CEP continuam iguais.
    @Test
    @DisplayName("Cenário: atualizar só a cidade do endereço. A cidade muda, e o logradouro, o bairro e o CEP continuam iguais.")
    void deveAtualizarApenasACidadeQuandoSoACidadeForInformada() {
        Endereco endereco = new Endereco(enderecoValido());

        // Formulário de atualização: logradouro, bairro, cep, cidade, uf, complement e numero
        // null = "não quero mudar este campo"
        var dados = new DadosEndereco(null, null, null, "Cianorte", null, null, null);

        endereco.atualizarInformacoes(dados);

        assertEquals("Rua das Flores", endereco.getLogradouro());   // NÃO mudou
        assertEquals("Cianorte", endereco.getCidade());             // mudou
        assertEquals("Centro", endereco.getBairro());               // NÃO mudou
        assertEquals("87000000", endereco.getCep());                // NÃO mudou
        assertEquals("PR", endereco.getUf());                       // NÃO mudou
        assertEquals("100", endereco.getNumero());                  // NÃO mudou
    }
}