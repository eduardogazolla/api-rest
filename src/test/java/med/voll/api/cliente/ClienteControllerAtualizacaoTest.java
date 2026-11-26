package med.voll.api.cliente;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClienteControllerAtualizacaoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteRepository repository;

    private Long id;

    @BeforeEach
    void cadastrarCliente() {
        id = repository.save(new Cliente(ClientesDeTeste.cadastroValido())).getId();
    }

    private ResultActions atualizar(String corpo) throws Exception {
        return mockMvc.perform(put("/clientes").contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    @Test
    @DisplayName("Deve alterar só o telefone e manter o resto")
    void deveAlterarSoOTelefone() throws Exception {
        atualizar("{\"id\":%d,\"telefone\":\"44911112222\"}".formatted(id)).andExpect(status().isOk());

        mockMvc.perform(get("/clientes/" + id))
                .andExpect(jsonPath("$.telefone").value("44911112222"))
                .andExpect(jsonPath("$.nome").value("Beatriz Rocha"))
                .andExpect(jsonPath("$.dataNascimento").value("1990-05-20"));
    }

    @Test
    @DisplayName("Deve retornar 400 apontando o nome quando ele vier em branco")
    void deveRetornar400QuandoNomeEmBranco() throws Exception {
        atualizar("{\"id\":%d,\"nome\":\"  \"}".formatted(id))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].campo").value("nome"))
                .andExpect(jsonPath("$[0].mensagem").value("não pode ficar em branco"));
    }

    @Test
    @DisplayName("Deve retornar 400 apontando endereco.cep quando o CEP for inválido")
    void deveRetornar400ApontandoEnderecoCepQuandoCepInvalido() throws Exception {
        atualizar("{\"id\":%d,\"endereco\":{\"cep\":\"abc\"}}".formatted(id))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].campo").value("endereco.cep"));
    }

    @Test
    @DisplayName("Deve apagar o complemento quando atualizar com texto vazio")
    void deveApagarComplementoQuandoAtualizarComTextoVazio() throws Exception {
        atualizar("{\"id\":%d,\"endereco\":{\"complemento\":\"\"}}".formatted(id)).andExpect(status().isOk());

        mockMvc.perform(get("/clientes/" + id))
                .andExpect(jsonPath("$.endereco.complemento").value(""))
                .andExpect(jsonPath("$.endereco.numero").value("100"));
    }

    @Test
    @DisplayName("Deve retornar 404 ao atualizar cliente inexistente")
    void deveRetornar404QuandoAtualizarClienteInexistente() throws Exception {
        atualizar("{\"id\":999999,\"telefone\":\"44911112222\"}")
                .andExpect(status().isNotFound());
    }
}
