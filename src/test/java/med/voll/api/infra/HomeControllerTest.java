package med.voll.api.infra;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HomeControllerTest {

    @Test
    @DisplayName("Deve encaminhar as rotas de tela para o index.html quando o front-end foi compilado")
    void deveEncaminharParaIndexQuandoFrontEndExistir() {
        var index = new ByteArrayResource("<html></html>".getBytes());

        assertEquals("forward:/index.html", new HomeController(index).home());
    }

    @Test
    @DisplayName("Deve redirecionar para o Swagger quando o front-end não foi compilado (build só com Maven)")
    void deveRedirecionarParaSwaggerQuandoFrontEndNaoExistir() {
        var inexistente = new ClassPathResource("static/nao-existe.html");

        assertEquals("redirect:/swagger-ui/index.html", new HomeController(inexistente).home());
    }
}
