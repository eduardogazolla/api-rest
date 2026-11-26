package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HomeControllerTest {

    @Test
    @DisplayName("Deve encaminhar as rotas de tela para o index.html do front-end")
    void deveEncaminharParaIndexDoFrontEnd() {
        assertEquals("forward:/index.html", new HomeController().home());
    }
}
