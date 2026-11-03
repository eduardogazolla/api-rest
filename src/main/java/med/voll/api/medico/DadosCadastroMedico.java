package med.voll.api.medico;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import med.voll.api.endereco.DadosEndereco;

public record DadosCadastroMedico(
		@Schema(example = "Ana Souza")
		@NotBlank
		String nome,
		@Schema(example = "ana.souza@voll.med")
		@NotBlank
		@Email
		String email,
		@Schema(example = "44999990000")
		@NotBlank
		String telefone,
		@Schema(description = "De 4 a 6 dígitos", example = "123456")
		@NotBlank
		@Pattern(regexp = "\\d{4,6}")
		String crm,
		@NotNull
		Especialidade especialidade,
		@NotNull
		@Valid
		DadosEndereco endereco) {

}
