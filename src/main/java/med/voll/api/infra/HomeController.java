package med.voll.api.infra;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Hidden
@Controller
public class HomeController {

    private final boolean frontEndCompilado;

    // O front só entra em static/ no build do Dockerfile. Num build só com Maven ele não existe,
    // e a página inicial volta a ser o Swagger em vez de um 404
    public HomeController(@Value("classpath:static/index.html") Resource indexDoFrontEnd) {
        this.frontEndCompilado = indexDoFrontEnd.exists();
    }

    // As rotas de tela são resolvidas pelo React Router no navegador. Sem este forward,
    // um F5 ou link direto em /cadastro chegaria ao Spring e daria 404
    @GetMapping({"/", "/inativos", "/cadastro", "/editar/{id:\\d+}"})
    public String home() {
        return frontEndCompilado ? "forward:/index.html" : "redirect:/swagger-ui/index.html";
    }
}
