package med.voll.api.cliente;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClienteControllerInativosTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteRepository repository;

    private Cliente salvarAtivo() {
        return repository.save(new Cliente(ClientesDeTeste.cadastroValido()));
    }

    @Test
    @DisplayName("Deve mover o cliente para os inativos ao excluir, sem apagar o registro")
    void deveMoverParaInativosQuandoExcluir() throws Exception {
        var cliente = salvarAtivo();

        mockMvc.perform(delete("/clientes/" + cliente.getId())).andExpect(status().isOk());

        mockMvc.perform(get("/clientes/inativos").param("size", "200"))
                .andExpect(jsonPath("$.content[*].cpf", hasItem(cliente.getCpf())));
        mockMvc.perform(get("/clientes").param("size", "200"))
                .andExpect(jsonPath("$.content[*].cpf", not(hasItem(cliente.getCpf()))));
        mockMvc.perform(get("/clientes/" + cliente.getId()))
                .andExpect(jsonPath("$.ativo").value(false));
    }

    @Test
    @DisplayName("Deve devolver o cliente aos ativos ao reativar")
    void deveVoltarParaAtivosQuandoReativar() throws Exception {
        var cliente = salvarAtivo();
        mockMvc.perform(delete("/clientes/" + cliente.getId())).andExpect(status().isOk());

        mockMvc.perform(patch("/clientes/" + cliente.getId() + "/ativar")).andExpect(status().isOk());

        mockMvc.perform(get("/clientes").param("size", "200"))
                .andExpect(jsonPath("$.content[*].cpf", hasItem(cliente.getCpf())));
    }

    @Test
    @DisplayName("Deve retornar 404 ao excluir ou reativar cliente inexistente")
    void deveRetornar404QuandoExcluirOuReativarInexistente() throws Exception {
        mockMvc.perform(delete("/clientes/999999")).andExpect(status().isNotFound());
        mockMvc.perform(patch("/clientes/999999/ativar")).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Não deve confundir a rota literal /inativos com um id de cliente")
    void naoDeveConfundirInativosComIdQuandoChamarRotaLiteral() throws Exception {
        mockMvc.perform(get("/clientes/inativos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Deve retornar 400 quando o sort da lista de inativos for inválido")
    void deveRetornar400QuandoSortDeInativosForInvalido() throws Exception {
        mockMvc.perform(get("/clientes/inativos").param("sort", "xyz"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").exists());
    }
}
