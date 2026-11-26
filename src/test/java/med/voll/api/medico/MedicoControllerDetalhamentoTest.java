package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicoControllerDetalhamentoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MedicoRepository repository;

    private Long id;

    @BeforeEach
    void cadastrarMedico() {
        // CRM e e-mail únicos por teste: o H2 em memória é compartilhado pelos testes do contexto
        var sufixo = String.valueOf(System.nanoTime() % 100000);
        var endereco = new DadosEndereco("Rua das Flores", "Centro", "87000000", "Maringá", "PR", "Sala 10", "100");
        var medico = new Medico(new DadosCadastroMedico("Diego Reis", "diego" + sufixo + "@voll.med",
                "44988887777", "7" + sufixo, Especialidade.ORTOPEDIA, endereco));
        id = repository.save(medico).getId();
    }

    @Test
    @DisplayName("Deve retornar 200 com telefone, endereço e situação ao detalhar médico existente")
    void deveRetornar200ComEnderecoQuandoDetalharMedicoExistente() throws Exception {
        mockMvc.perform(get("/medicos/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Diego Reis"))
                .andExpect(jsonPath("$.telefone").value("44988887777"))
                .andExpect(jsonPath("$.endereco.cep").value("87000000"))
                .andExpect(jsonPath("$.endereco.complemento").value("Sala 10"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    @Test
    @DisplayName("Deve retornar 404 ao detalhar médico inexistente")
    void deveRetornar404QuandoDetalharMedicoInexistente() throws Exception {
        mockMvc.perform(get("/medicos/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deve retornar 400 apontando endereco.cep quando atualizar com CEP inválido")
    void deveRetornar400QuandoAtualizarComCepInvalido() throws Exception {
        mockMvc.perform(put("/medicos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":%d,\"endereco\":{\"cep\":\"abc\"}}".formatted(id)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].campo").value("endereco.cep"))
                .andExpect(jsonPath("$[0].mensagem").value("deve ter 8 dígitos, sem traço"));
    }

    @Test
    @DisplayName("Deve apagar o complemento quando atualizar com texto vazio")
    void deveApagarComplementoQuandoAtualizarComTextoVazio() throws Exception {
        mockMvc.perform(put("/medicos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":%d,\"endereco\":{\"complemento\":\"\"}}".formatted(id)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/medicos/" + id))
                .andExpect(jsonPath("$.endereco.complemento").value(""))
                .andExpect(jsonPath("$.endereco.numero").value("100"));
    }
}
