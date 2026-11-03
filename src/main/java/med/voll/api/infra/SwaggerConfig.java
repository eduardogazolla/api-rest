package med.voll.api.infra;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(
        title = "Voll.med API",
        version = "1.0",
        description = "API REST de estudo (PDI) para cadastro de médicos da clínica fictícia Voll.med. Contém apenas dados fictícios."))
public class SwaggerConfig {
}
