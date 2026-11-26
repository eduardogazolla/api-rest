package med.voll.api.endereco;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DadosEndereco(
		@Schema(example = "Rua das Flores")
		@NotBlank(message = "é obrigatório")
		String logradouro,
		@Schema(example = "Centro")
		@NotBlank(message = "é obrigatório")
		String bairro,
		@Schema(description = "8 dígitos, sem traço", example = "87000000")
		@NotBlank(message = "é obrigatório")
		@Pattern(regexp = "\\d{8}", message = "deve ter 8 dígitos, sem traço")
		String cep,
		@Schema(example = "Maringá")
		@NotBlank(message = "é obrigatório")
		String cidade,
		@Schema(example = "PR")
		@NotBlank(message = "é obrigatório")
		String uf,
		@Schema(example = "Sala 10")
		String complemento,
		@Schema(example = "100")
		String numero) {}
