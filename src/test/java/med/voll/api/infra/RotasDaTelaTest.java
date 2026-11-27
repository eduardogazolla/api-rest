package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RotasDaTelaTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest
    @ValueSource(strings = {"/", "/app", "/app/medicos", "/app/medicos/inativos", "/app/clientes/cadastro", "/app/clientes/editar/7"})
    @DisplayName("Deve encaminhar as rotas de tela (/app) para o index.html, para F5 e links diretos funcionarem")
    void deveEncaminharParaIndexQuandoRotaForDeTela(String rota) throws Exception {
        mockMvc.perform(get(rota))
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    @DisplayName("Não deve encaminhar os endereços antigos de tela, que saíram com a mudança para /app")
    void naoDeveEncaminharRotasAntigasDeTela() throws Exception {
        mockMvc.perform(get("/inativos"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deve continuar servindo o health check junto das rotas de tela")
    void deveContinuarServindoHealthQuandoRotasDeTelaExistirem() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }
}
