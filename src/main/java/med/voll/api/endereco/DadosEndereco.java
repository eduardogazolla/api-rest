package med.voll.api.endereco;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DadosEndereco(
		@Schema(example = "Rua das Flores")
		@NotBlank
		String logradouro,
		@Schema(example = "Centro")
		@NotBlank
		String bairro,
		@Schema(description = "8 dígitos, sem traço", example = "87000000")
		@NotBlank
		@Pattern(regexp = "\\d{8}")
		String cep,
		@Schema(example = "Maringá")
		@NotBlank
		String cidade,
		@Schema(example = "PR")
		@NotBlank
		String uf,
		@Schema(example = "Sala 10")
		String complemento,
		@Schema(example = "100")
		String numero) {}
