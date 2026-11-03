package med.voll.api.medico;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicoControllerOrdenacaoTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve retornar 400 quando o sort usa uma propriedade que não existe")
    void deveRetornar400QuandoSortTiverPropriedadeInexistente() throws Exception {
        mockMvc.perform(get("/medicos").param("sort", "xyz"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando o sort vem em formato JSON")
    void deveRetornar400QuandoSortVierEmFormatoJson() throws Exception {
        mockMvc.perform(get("/medicos").param("sort", "[\"nome\"]"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 200 quando o sort é válido")
    void deveRetornar200QuandoSortForValido() throws Exception {
        mockMvc.perform(get("/medicos").param("sort", "crm,desc"))
                .andExpect(status().isOk());
    }
}
