package med.voll.api.medico;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicoControllerDuplicidadeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MedicoRepository repository;

    private ResultActions cadastrar(String email, String crm) throws Exception {
        var corpo = """
                {"nome":"Carla Dias","email":"%s","telefone":"44999990000","crm":"%s",
                 "especialidade":"DERMATOLOGIA",
                 "endereco":{"logradouro":"Rua das Flores","bairro":"Centro","cep":"87000000",
                             "cidade":"Maringá","uf":"PR"}}
                """.formatted(email, crm);
        return mockMvc.perform(post("/medicos").contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    @Test
    @DisplayName("Deve retornar 409 apontando o campo CRM quando cadastrar um CRM repetido")
    void deveRetornar409ComCampoCrmQuandoCadastrarCrmRepetido() throws Exception {
        cadastrar("carla1@voll.med", "900001").andExpect(status().isOk());

        cadastrar("carla2@voll.med", "900001")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$[0].campo").value("crm"))
                .andExpect(jsonPath("$[0].mensagem").value("Já existe um médico com este CRM (ele pode estar inativo)."));
    }

    @Test
    @DisplayName("Deve retornar 409 apontando o e-mail quando cadastrar um e-mail repetido")
    void deveRetornar409ComCampoEmailQuandoCadastrarEmailRepetido() throws Exception {
        cadastrar("carla3@voll.med", "900003").andExpect(status().isOk());

        cadastrar("carla3@voll.med", "900004")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$[0].campo").value("email"));
    }

    @Test
    @DisplayName("Deve retornar 409 quando o CRM pertencer a um médico inativo")
    void deveRetornar409QuandoCrmPertencerAMedicoInativo() throws Exception {
        cadastrar("carla5@voll.med", "900005").andExpect(status().isOk());
        var id = repository.findAll().stream()
                .filter(m -> m.getCrm().equals("900005")).findFirst().orElseThrow().getId();
        mockMvc.perform(delete("/medicos/" + id)).andExpect(status().isOk());

        cadastrar("carla6@voll.med", "900005")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$[0].campo").value("crm"));
    }
}
