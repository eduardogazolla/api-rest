package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HomeControllerTest {

    @Test
    @DisplayName("Deve redirecionar a página inicial para o Swagger UI")
    void deveRedirecionarParaSwagger() {
        assertEquals("redirect:/swagger-ui/index.html", new HomeController().home());
    }
}
