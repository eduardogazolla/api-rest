package med.voll.api.medico;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicoControllerValidacaoTest {

    @Autowired
    private MockMvc mockMvc;

    private String cadastro(String nome, String crm, String cep) {
        return """
                {"nome":"%s","email":"validacao@voll.med","telefone":"44999990000","crm":"%s",
                 "especialidade":"CARDIOLOGIA",
                 "endereco":{"logradouro":"Rua das Flores","bairro":"Centro","cep":"%s",
                             "cidade":"Maringá","uf":"PR"}}
                """.formatted(nome, crm, cep);
    }

    @Test
    @DisplayName("Deve retornar 400 com a lista de erros por campo quando o cadastro for inválido")
    void deveRetornar400ComErrosPorCampoQuandoCadastroForInvalido() throws Exception {
        mockMvc.perform(post("/medicos").contentType(MediaType.APPLICATION_JSON)
                        .content(cadastro("Ana Souza", "12", "abc")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[?(@.campo == 'crm')].mensagem").value("deve ter de 4 a 6 dígitos"))
                .andExpect(jsonPath("$[?(@.campo == 'endereco.cep')].mensagem").value("deve ter 8 dígitos, sem traço"));
    }

    @Test
    @DisplayName("Deve retornar 400 no campo nome, e não 409 do banco, quando o nome passar de 100 caracteres")
    void deveRetornar400QuandoNomePassarDoTamanhoDaColuna() throws Exception {
        mockMvc.perform(post("/medicos").contentType(MediaType.APPLICATION_JSON)
                        .content(cadastro("A".repeat(101), "123456", "87000000")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[?(@.campo == 'nome')].mensagem").value("deve ter no máximo 100 caracteres"));
    }

    @Test
    @DisplayName("Deve retornar as mensagens em português quando um campo obrigatório faltar")
    void deveRetornarMensagensEmPortuguesQuandoCampoObrigatorioFaltar() throws Exception {
        mockMvc.perform(post("/medicos").contentType(MediaType.APPLICATION_JSON)
                        .content(cadastro("", "123456", "87000000")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[?(@.campo == 'nome')].mensagem").value("é obrigatório"));
    }
    @Test
    @DisplayName("Deve retornar 400 apontando o campo quando o JSON tiver um valor que não dá para ler")
    void deveRetornar400ApontandoCampoQuandoJsonTiverValorIlegivel() throws Exception {
        var corpo = cadastro("Ana Souza", "123456", "87000000").replace("CARDIOLOGIA", "PEDIATRIA");
        mockMvc.perform(post("/medicos").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].campo").value("especialidade"))
                .andExpect(jsonPath("$[0].mensagem").value("formato inválido"));
    }
}
