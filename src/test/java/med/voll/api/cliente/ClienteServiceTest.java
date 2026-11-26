package med.voll.api.cliente;

import med.voll.api.infra.CadastroDuplicadoException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository repository;

    @InjectMocks
    private ClienteService service;

    @Test
    @DisplayName("Deve recusar o cadastro quando o CPF já existir, sem salvar")
    void deveLancarCadastroDuplicadoQuandoCpfJaExistir() {
        var dados = ClientesDeTeste.cadastroValido();
        when(repository.existsByCpf(dados.cpf())).thenReturn(true);

        var excecao = assertThrows(CadastroDuplicadoException.class, () -> service.cadastrar(dados));

        assertEquals("cpf", excecao.getCampo());
        assertEquals("Já existe um cliente com este CPF (ele pode estar inativo).", excecao.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Deve recusar o cadastro quando o e-mail já existir, sem salvar")
    void deveLancarCadastroDuplicadoQuandoEmailJaExistir() {
        var dados = ClientesDeTeste.cadastroValido();
        when(repository.existsByEmail(dados.email())).thenReturn(true);

        var excecao = assertThrows(CadastroDuplicadoException.class, () -> service.cadastrar(dados));

        assertEquals("email", excecao.getCampo());
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Deve apontar o CPF quando CPF e e-mail já existirem")
    void deveChecarCpfAntesDoEmailQuandoAmbosExistirem() {
        var dados = ClientesDeTeste.cadastroValido();
        when(repository.existsByCpf(dados.cpf())).thenReturn(true);

        var excecao = assertThrows(CadastroDuplicadoException.class, () -> service.cadastrar(dados));

        assertEquals("cpf", excecao.getCampo());
        verify(repository, never()).existsByEmail(any());
    }

    @Test
    @DisplayName("Deve converter os clientes ativos para dados de listagem")
    void deveConverterClientesAtivosParaDadosDeListagem() {
        var cliente = new Cliente(ClientesDeTeste.cadastroValido());
        Pageable paginacao = PageRequest.of(0, 10);
        when(repository.findAllByAtivoTrue(paginacao)).thenReturn(new PageImpl<>(List.of(cliente)));

        Page<DadosListagemCliente> resultado = service.listar(paginacao);

        var item = resultado.getContent().get(0);
        assertEquals("Beatriz Rocha", item.nome());
        assertEquals(cliente.getCpf(), item.cpf());
        assertEquals(cliente.getEmail(), item.email());
    }

    @Test
    @DisplayName("Deve retornar página vazia quando não houver clientes ativos")
    void deveRetornarPaginaVaziaQuandoNaoHouverClientesAtivos() {
        Pageable paginacao = PageRequest.of(0, 10);
        when(repository.findAllByAtivoTrue(paginacao)).thenReturn(Page.empty());

        assertTrue(service.listar(paginacao).isEmpty());
    }

    @Test
    @DisplayName("Deve detalhar um cliente inativo com todos os dados")
    void deveDetalharClienteInativoComTodosOsDados() {
        var cliente = new Cliente(ClientesDeTeste.cadastroValido());
        cliente.excluir();
        when(repository.findById(1L)).thenReturn(Optional.of(cliente));

        DadosDetalhamentoCliente detalhe = service.detalhar(1L);

        assertFalse(detalhe.ativo());
        assertEquals(LocalDate.of(1990, 5, 20), detalhe.dataNascimento());
        assertEquals("44999998888", detalhe.telefone());
        assertEquals("87013000", detalhe.endereco().cep());
    }

    @Test
    @DisplayName("Deve lançar exceção ao detalhar cliente inexistente")
    void deveLancarExcecaoAoDetalharClienteInexistente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        var excecao = assertThrows(EntityNotFoundException.class, () -> service.detalhar(999L));

        assertEquals("Cliente não encontrado: 999", excecao.getMessage());
    }

    @Test
    @DisplayName("Deve salvar um cliente ativo quando CPF e e-mail forem inéditos")
    void deveSalvarClienteAtivoQuandoCpfEEmailForemIneditos() {
        var dados = ClientesDeTeste.cadastroValido();

        service.cadastrar(dados);

        var captor = ArgumentCaptor.forClass(Cliente.class);
        verify(repository).save(captor.capture());
        assertTrue(captor.getValue().getAtivo());
        assertEquals(dados.cpf(), captor.getValue().getCpf());
    }
}
