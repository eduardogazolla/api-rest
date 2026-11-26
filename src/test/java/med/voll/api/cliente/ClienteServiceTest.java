package med.voll.api.cliente;

import med.voll.api.infra.CadastroDuplicadoException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
