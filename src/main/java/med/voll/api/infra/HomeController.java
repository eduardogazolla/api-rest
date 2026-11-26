package med.voll.api.infra;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Hidden
@Controller
public class HomeController {

    // As rotas de tela são resolvidas pelo React Router no navegador. Sem este forward,
    // um F5 ou link direto em /cadastro chegaria ao Spring e daria 404
    @GetMapping({"/", "/inativos", "/cadastro", "/editar/{id:\\d+}"})
    public String home() {
        return "forward:/index.html";
    }
}
