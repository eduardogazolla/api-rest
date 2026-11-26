package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicoControllerInativosTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MedicoRepository repository;

    private Long salvar(String nome, String crm) {
        var endereco = new DadosEndereco("Rua das Flores", "Centro", "87000000", "Maringá", "PR", null, null);
        var medico = new Medico(new DadosCadastroMedico(nome, crm + "@inativos.voll.med", "44999990000",
                crm, Especialidade.GINECOLOGIA, endereco));
        return repository.save(medico).getId();
    }

    @Test
    @DisplayName("Deve listar apenas médicos inativos na rota de inativos")
    void deveListarApenasInativosQuandoChamarInativos() throws Exception {
        salvar("Elisa Ativa", "800001");
        var idExcluido = salvar("Fábio Excluído", "800002");
        mockMvc.perform(delete("/medicos/" + idExcluido)).andExpect(status().isOk());

        mockMvc.perform(get("/medicos/inativos").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].nome", hasItem("Fábio Excluído")))
                .andExpect(jsonPath("$.content[*].nome", not(hasItem("Elisa Ativa"))));

        mockMvc.perform(get("/medicos").param("size", "100"))
                .andExpect(jsonPath("$.content[*].nome", everyItem(not("Fábio Excluído"))));
    }

    @Test
    @DisplayName("Deve retornar 400 quando o sort da lista de inativos for inválido")
    void deveRetornar400QuandoSortDeInativosForInvalido() throws Exception {
        mockMvc.perform(get("/medicos/inativos").param("sort", "xyz"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").exists());
    }

    @Test
    @DisplayName("Não deve confundir a rota literal /inativos com um id de médico")
    void naoDeveConfundirInativosComIdQuandoChamarRotaLiteral() throws Exception {
        mockMvc.perform(get("/medicos/inativos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
