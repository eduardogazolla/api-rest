package med.voll.api.medico;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import med.voll.api.endereco.DadosEndereco;

public record DadosCadastroMedico(
		@Schema(example = "Ana Souza")
		@NotBlank(message = "é obrigatório")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String nome,
		@Schema(example = "ana.souza@voll.med")
		@NotBlank(message = "é obrigatório")
		@Email(message = "deve ser um e-mail válido")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String email,
		@Schema(example = "44999990000")
		@NotBlank(message = "é obrigatório")
		@Size(max = 20, message = "deve ter no máximo {max} caracteres")
		String telefone,
		@Schema(description = "De 4 a 6 dígitos", example = "123456")
		@NotBlank(message = "é obrigatório")
		@Pattern(regexp = "\\d{4,6}", message = "deve ter de 4 a 6 dígitos")
		String crm,
		@NotNull(message = "é obrigatório")
		Especialidade especialidade,
		@NotNull(message = "é obrigatório")
		@Valid
		DadosEndereco endereco) {

}
