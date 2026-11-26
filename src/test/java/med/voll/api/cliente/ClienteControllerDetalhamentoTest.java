package med.voll.api.cliente;

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
class ClienteControllerDetalhamentoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteRepository repository;

    @Test
    @DisplayName("Deve retornar 200 com data de nascimento ISO, endereço e situação ao detalhar")
    void deveRetornar200ComDataDeNascimentoEEnderecoQuandoDetalhar() throws Exception {
        var cliente = repository.save(new Cliente(ClientesDeTeste.cadastroValido()));

        mockMvc.perform(get("/clientes/" + cliente.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(cliente.getCpf()))
                .andExpect(jsonPath("$.dataNascimento").value("1990-05-20"))
                .andExpect(jsonPath("$.telefone").value("44999998888"))
                .andExpect(jsonPath("$.endereco.cep").value("87013000"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    @Test
    @DisplayName("Deve retornar 404 quando o cliente não existir")
    void deveRetornar404QuandoClienteNaoExistir() throws Exception {
        mockMvc.perform(get("/clientes/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deve retornar 400, e não erro interno, quando o id não for número")
    void deveRetornar400QuandoIdNaoForNumero() throws Exception {
        mockMvc.perform(get("/clientes/abc"))
                .andExpect(status().isBadRequest());
    }
}
