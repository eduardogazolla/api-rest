package med.voll.api.cliente;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static med.voll.api.cliente.ClientesDeTeste.json;
import static med.voll.api.cliente.ClientesDeTeste.novoCpf;
import static med.voll.api.cliente.ClientesDeTeste.novoEmail;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClienteControllerCadastroTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteRepository repository;

    private ResultActions cadastrar(String corpo) throws Exception {
        return mockMvc.perform(post("/clientes").contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    @Test
    @DisplayName("Deve retornar 200 e gravar um cliente ativo quando o cadastro for válido")
    void deveRetornar200QuandoCadastroForValido() throws Exception {
        var cpf = novoCpf();

        cadastrar(json(cpf, novoEmail(), "1990-05-20")).andExpect(status().isOk());

        assertTrue(
                repository.findAll().stream().anyMatch(c -> c.getCpf().equals(cpf) && c.getAtivo()));
    }

    @Test
    @DisplayName("Deve retornar 400 apontando o CPF quando o dígito verificador for inválido")
    void deveRetornar400ComCampoCpfQuandoCpfForInvalido() throws Exception {
        cadastrar(json("52998224724", novoEmail(), "1990-05-20"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].campo").value("cpf"))
                .andExpect(jsonPath("$[0].mensagem").value("CPF inválido"));
    }

    @Test
    @DisplayName("Deve retornar 400 apontando a data de nascimento quando ela não estiver no formato ISO")
    void deveRetornar400ComCampoDataNascimentoQuandoDataForIlegivel() throws Exception {
        cadastrar(json(novoCpf(), novoEmail(), "31/02/1990"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].campo").value("dataNascimento"))
                .andExpect(jsonPath("$[0].mensagem").value("formato inválido"));
    }

    @Test
    @DisplayName("Deve retornar 409 apontando o CPF quando ele já estiver cadastrado")
    void deveRetornar409ComCampoCpfQuandoCpfRepetir() throws Exception {
        var cpf = novoCpf();
        cadastrar(json(cpf, novoEmail(), "1990-05-20")).andExpect(status().isOk());

        cadastrar(json(cpf, novoEmail(), "1990-05-20"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$[0].campo").value("cpf"))
                .andExpect(jsonPath("$[0].mensagem").value("Já existe um cliente com este CPF (ele pode estar inativo)."));
    }

    @Test
    @DisplayName("Deve retornar 409 apontando o e-mail quando ele já estiver cadastrado")
    void deveRetornar409ComCampoEmailQuandoEmailRepetir() throws Exception {
        var email = novoEmail();
        cadastrar(json(novoCpf(), email, "1990-05-20")).andExpect(status().isOk());

        cadastrar(json(novoCpf(), email, "1990-05-20"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$[0].campo").value("email"));
    }

    @Test
    @DisplayName("Deve retornar 409 quando o CPF pertencer a um cliente inativo")
    void deveRetornar409QuandoCpfPertencerAClienteInativo() throws Exception {
        var inativo = new Cliente(ClientesDeTeste.cadastroValido());
        inativo.excluir();
        repository.save(inativo);

        cadastrar(json(inativo.getCpf(), novoEmail(), "1990-05-20"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$[0].campo").value("cpf"));
    }
}
