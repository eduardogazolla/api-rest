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

// Liga o Mockito neste teste.
// Sem isso, @Mock e @InjectMocks são ignorados e tudo fica null.
@ExtendWith(MockitoExtension.class)
class MedicoServiceTest {

    // @Mock: cria o ARQUIVISTA DE MENTIRA.
    // Não acessa banco. Só responde o que a gente ensinar.
    @Mock
    private MedicoRepository repository;

    // @InjectMocks: cria um MedicoService DE VERDADE e entrega o
    // arquivista de mentira no construtor dele.
    // (Lembra que o construtor pede um MedicoRepository? É ali que entra.)
    @InjectMocks
    private MedicoService service;

    // Mesmos ajudantes da MedicoTest
    private DadosCadastroMedico cadastroValido() {
        var endereco = new DadosEndereco("Rua das Flores", "Centro", "87000000",
                "Maringá", "PR", null, "100");
        return new DadosCadastroMedico("Ana Souza", "ana@voll.med", "44999990000",
                "123456", Especialidade.CARDIOLOGIA, endereco);
    }

    @Test
    void deveInativarMedicoAoExcluir() {
        // ARRANGE
        // 1. Crio um médico de verdade (ele nasce ativo)
        Medico medico = new Medico(cadastroValido());

        // 2. ENSINO o mock: "quando pedirem a ficha 1, entregue este médico"
        when(repository.findById(1L)).thenReturn(Optional.of(medico));

        // ACT: chamo o Service de verdade
        service.excluir(1L);

        // ASSERT
        // 1. O médico foi inativado?
        assertFalse(medico.getAtivo());

        // 2. PERGUNTO ao mock: "o Service te pediu a ficha 1, exatamente 1 vez?"
        verify(repository, times(1)).findById(1L);

        //Dado que existe um médico ativo com id 1        → when(...).thenReturn(medico)
        //Quando eu excluo o médico 1                     → service.excluir(1L)
        //Então o médico fica inativo                     → assertFalse(medico.getAtivo())
        //E o repositório foi consultado uma vez          → verify(repository, times(1))
    }

    @Test
    void deveCadastrarMedicoAtivo(){
        // ARRANGE
        var dados = cadastroValido();

        // ACT
        // 1. Crio um médico de verdade (ele nasce ativo)
        service.cadastrar(dados);

        // ASSERT
        // 1. Preparo a "câmera" para ver objetos do tipo Medico
        ArgumentCaptor<Medico> captor = ArgumentCaptor.forClass(Medico.class);

        // 2. Confiro que o save foi chamado e tiro a foto do que foi passado
        verify(repository).save(captor.capture());

        // 3. Pego a foto: este é o medico que o SERVICE criou e salvou
        Medico medicoSalvo = captor.getValue();

        // 4. Agora verifico o médico certo
        assertTrue(medicoSalvo.getAtivo());
        assertEquals("Ana Souza", medicoSalvo.getNome());
        assertEquals("ana@voll.med", medicoSalvo.getEmail());
    }

    @Test
    void deveLancarExcecaoAoExcluirMedicoInexistente(){
        // ARRANGE: ensino o mock que a ficha 999 NÃO existe (caixa vazia)
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // ACT + ASSERT: espero que excluir a 999 lance EntityNotFoundException
        assertThrows(EntityNotFoundException.class,
                () -> service.excluir(999L));
    }

    @Test
    void deveLancarExcecaoAoAtualizarMedicoInexistente() {
        // ARRANGE: a ficha 999 não existe
        when(repository.findById(999L)).thenReturn(Optional.empty());
        var dados = new DadosAtualizacaoMedico(999L, "Eduardo", null, null);

        // ACT + ASSERT
        assertThrows(EntityNotFoundException.class,
                () -> service.atualizar(dados));
    }

    @Test
    void deveAtualizarNomeDoMedico() {
        // ARRANGE
        // Este médico ENTRA no Service pelo Optional.of, então aqui o new faz sentido
        Medico medico = new Medico(cadastroValido());
        when(repository.findById(1L)).thenReturn(Optional.of(medico));

        var dados = new DadosAtualizacaoMedico(1L, "Ana Lima", null, null);

        // ACT
        service.atualizar(dados);

        // ASSERT: confiro o MESMO objeto que o mock entregou ao Service
        assertEquals("Ana Lima", medico.getNome());          // mudou
        assertEquals("44999990000", medico.getTelefone());   // NÃO mudou
        verify(repository).findById(1L);
    }

    @Test
    void deveConverterMedicosParaDadosDeListagem() {
        // ARRANGE
        Medico medico = new Medico(cadastroValido());
        Pageable paginacao = PageRequest.of(0, 10);   // página 0, 10 por página

        // Ensino o mock: "quando pedirem os ativos dessa página,
        // devolva uma página com este médico dentro"
        when(repository.findAllByAtivoTrue(paginacao))
                .thenReturn(new PageImpl<>(List.of(medico)));

        // ACT
        Page<DadosListagemMedico> resultado = service.listar(paginacao);

        // ASSERT
        // 1. Veio exatamente 1 item?
        assertEquals(1, resultado.getTotalElements());

        // 2. Pego o primeiro item e confiro se o resumo foi montado certo.
        //    Record não usa getNome(): o "getter" tem o nome do campo, nome()
        DadosListagemMedico item = resultado.getContent().get(0);
        assertEquals("Ana Souza", item.nome());
        assertEquals("ana@voll.med", item.email());
        assertEquals("123456", item.crm());
        assertEquals(Especialidade.CARDIOLOGIA, item.especialidade());

        // 3. O Service pediu os ATIVOS (e não um findAll qualquer)?
        verify(repository).findAllByAtivoTrue(paginacao);
    }

    // Edge case: nenhum médico ativo, a página deve vir vazia (e não dar erro)
    @Test
    void deveRetornarPaginaVaziaQuandoNaoHouverMedicosAtivos() {
        Pageable paginacao = PageRequest.of(0, 10);
        when(repository.findAllByAtivoTrue(paginacao)).thenReturn(Page.empty());

        Page<DadosListagemMedico> resultado = service.listar(paginacao);

        assertTrue(resultado.isEmpty());
    }
}