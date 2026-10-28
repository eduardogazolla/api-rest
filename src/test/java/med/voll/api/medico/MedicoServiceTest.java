package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import jakarta.persistence.EntityNotFoundException;
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
}