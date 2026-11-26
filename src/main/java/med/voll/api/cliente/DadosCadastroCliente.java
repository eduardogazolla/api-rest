package med.voll.api.cliente;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import med.voll.api.endereco.DadosEndereco;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record DadosCadastroCliente(
		@Schema(example = "Beatriz Rocha")
		@NotBlank(message = "é obrigatório")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String nome,
		@Schema(example = "beatriz.rocha@exemplo.com")
		@NotBlank(message = "é obrigatório")
		@Email(message = "deve ser um e-mail válido")
		@Size(max = 100, message = "deve ter no máximo {max} caracteres")
		String email,
		@Schema(example = "44999998888")
		@NotBlank(message = "é obrigatório")
		@Size(max = 20, message = "deve ter no máximo {max} caracteres")
		String telefone,
		@Schema(description = "11 dígitos, sem pontuação, com dígitos verificadores válidos", example = "52998224725")
		@NotBlank(message = "é obrigatório")
		@Pattern(regexp = "\\d{11}", message = "deve ter 11 dígitos, sem pontuação")
		@CPF(message = "CPF inválido")
		String cpf,
		@Schema(description = "Formato AAAA-MM-DD, anterior a hoje", example = "1990-05-20")
		@NotNull(message = "é obrigatório")
		@Past(message = "deve ser uma data no passado")
		LocalDate dataNascimento,
		@NotNull(message = "é obrigatório")
		@Valid
		DadosEndereco endereco) {

}
