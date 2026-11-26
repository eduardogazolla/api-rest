package med.voll.api.endereco;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DadosEndereco(
		@Schema(example = "Rua das Flores")
		@NotBlank(message = "é obrigatório")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String logradouro,
		@Schema(example = "Centro")
		@NotBlank(message = "é obrigatório")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String bairro,
		@Schema(description = "8 dígitos, sem traço", example = "87000000")
		@NotBlank(message = "é obrigatório")
		@Pattern(regexp = "\\d{8}", message = "deve ter 8 dígitos, sem traço")
		String cep,
		@Schema(example = "Maringá")
		@NotBlank(message = "é obrigatório")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String cidade,
		@Schema(example = "PR")
		@NotBlank(message = "é obrigatório")
		@Pattern(regexp = "[A-Za-z]{2}", message = "deve ter 2 letras")
		String uf,
		@Schema(example = "Sala 10")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String complemento,
		@Schema(example = "100")
		@Size(max = 20, message = "deve ter no máximo {max} caracteres")
		String numero) {

	public DadosEndereco(Endereco endereco) {
		this(endereco.getLogradouro(), endereco.getBairro(), endereco.getCep(), endereco.getCidade(),
				endereco.getUf(), endereco.getComplemento(), endereco.getNumero());
	}
}
