package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicoServiceTest {

    @Mock
    private MedicoRepository repository;

    @InjectMocks
    private MedicoService service;

    private DadosCadastroMedico cadastroValido() {
        var endereco = new DadosEndereco("Rua das Flores", "Centro", "87000000",
                "Maringá", "PR", null, "100");
        return new DadosCadastroMedico("Ana Souza", "ana@voll.med", "44999990000",
                "123456", Especialidade.CARDIOLOGIA, endereco);
    }

    @Test
    void deveInativarMedicoAoExcluir() {
        Medico medico = new Medico(cadastroValido());

        when(repository.findById(1L)).thenReturn(Optional.of(medico));

        service.excluir(1L);

        assertFalse(medico.getAtivo());

        verify(repository, times(1)).findById(1L);
    }

    @Test
    void deveCadastrarMedicoAtivo(){
        var dados = cadastroValido();

        service.cadastrar(dados);

        ArgumentCaptor<Medico> captor = ArgumentCaptor.forClass(Medico.class);

        verify(repository).save(captor.capture());

        Medico medicoSalvo = captor.getValue();

        assertTrue(medicoSalvo.getAtivo());
        assertEquals("Ana Souza", medicoSalvo.getNome());
        assertEquals("ana@voll.med", medicoSalvo.getEmail());
    }

    @Test
    void deveLancarExcecaoAoExcluirMedicoInexistente(){
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.excluir(999L));
    }

    @Test
    void deveLancarExcecaoAoAtualizarMedicoInexistente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        var dados = new DadosAtualizacaoMedico(999L, "Eduardo", null, null);

        assertThrows(EntityNotFoundException.class,
                () -> service.atualizar(dados));
    }

    @Test
    void deveAtualizarNomeDoMedico() {
        Medico medico = new Medico(cadastroValido());
        when(repository.findById(1L)).thenReturn(Optional.of(medico));

        var dados = new DadosAtualizacaoMedico(1L, "Ana Lima", null, null);

        service.atualizar(dados);

        assertEquals("Ana Lima", medico.getNome());
        assertEquals("44999990000", medico.getTelefone());
        verify(repository).findById(1L);
    }

    @Test
    void deveConverterMedicosParaDadosDeListagem() {
        Medico medico = new Medico(cadastroValido());
        Pageable paginacao = PageRequest.of(0, 10);

        when(repository.findAllByAtivoTrue(paginacao))
                .thenReturn(new PageImpl<>(List.of(medico)));

        Page<DadosListagemMedico> resultado = service.listar(paginacao);

        assertEquals(1, resultado.getTotalElements());

        DadosListagemMedico item = resultado.getContent().get(0);
        assertEquals("Ana Souza", item.nome());
        assertEquals("ana@voll.med", item.email());
        assertEquals("123456", item.crm());
        assertEquals(Especialidade.CARDIOLOGIA, item.especialidade());

        verify(repository).findAllByAtivoTrue(paginacao);
    }

    @Test
    void deveRetornarPaginaVaziaQuandoNaoHouverMedicosAtivos() {
        Pageable paginacao = PageRequest.of(0, 10);
        when(repository.findAllByAtivoTrue(paginacao)).thenReturn(Page.empty());

        Page<DadosListagemMedico> resultado = service.listar(paginacao);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveReativarMedicoInativo() {
        Medico medico = new Medico(cadastroValido());
        medico.excluir();
        when(repository.findById(1L)).thenReturn(Optional.of(medico));

        service.ativar(1L);

        assertTrue(medico.getAtivo());
        verify(repository).findById(1L);
    }

    @Test
    void deveLancarExcecaoAoAtivarMedicoInexistente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.ativar(999L));
    }
}