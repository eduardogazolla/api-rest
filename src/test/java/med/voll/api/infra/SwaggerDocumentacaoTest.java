package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SwaggerDocumentacaoTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve usar URL relativa como servidor, para funcionar em http e https")
    void deveUsarUrlRelativaComoServidor() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.servers[0].url").value("/"));
    }

    @Test
    @DisplayName("Não deve documentar as rotas internas /health e /")
    void naoDeveDocumentarRotasInternas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/health']").doesNotExist())
                .andExpect(jsonPath("$.paths['/']").doesNotExist())
                .andExpect(jsonPath("$.paths['/inativos']").doesNotExist())
                .andExpect(jsonPath("$.paths['/cadastro']").doesNotExist());
    }

    @Test
    @DisplayName("Deve documentar os endpoints de detalhamento e de inativos")
    void deveDocumentarEndpointsNovosQuandoGerarApiDocs() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/medicos/{id}'].get").exists())
                .andExpect(jsonPath("$.paths['/medicos/inativos'].get").exists())
                .andExpect(jsonPath("$.paths['/medicos'].post.responses['409']").exists());
    }

    @Test
    @DisplayName("Deve manter o Swagger UI disponível ao lado do front-end")
    void deveManterSwaggerUiDisponivel() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }
}
