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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClienteControllerListagemTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteRepository repository;

    @Test
    @DisplayName("Deve listar só os ativos, ordenados por nome por padrão")
    void deveListarSomenteAtivosOrdenadosPorNome() throws Exception {
        // "Aaron" fica antes dos demais nomes de teste; o inativo viria primeiro se fosse listado
        repository.save(new Cliente(ClientesDeTeste.cadastroComNome("Aaron Ativo")));
        var inativo = new Cliente(ClientesDeTeste.cadastroComNome("Aaron Aaa Inativo"));
        inativo.excluir();
        repository.save(inativo);

        mockMvc.perform(get("/clientes").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nome").value("Aaron Ativo"))
                .andExpect(jsonPath("$.content[*].nome", not(hasItem("Aaron Aaa Inativo"))))
                .andExpect(jsonPath("$.content[0].cpf").exists())
                .andExpect(jsonPath("$.content[0].telefone").doesNotExist());
    }

    @Test
    @DisplayName("Deve retornar 400 com a mensagem genérica quando o sort for inválido")
    void deveRetornar400QuandoSortForInvalido() throws Exception {
        mockMvc.perform(get("/clientes").param("sort", "xyz"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Parâmetro sort inválido. Use um campo da listagem, por exemplo: nome ou nome,desc"));
    }

    @Test
    @DisplayName("Deve retornar 200 quando o sort for válido")
    void deveRetornar200QuandoSortForValido() throws Exception {
        mockMvc.perform(get("/clientes").param("sort", "cpf,desc"))
                .andExpect(status().isOk());
    }
}
