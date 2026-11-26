package med.voll.api.endereco;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;

// Atualização parcial: campo nulo não é alterado, por isso nenhum campo é obrigatório.
// Só o formato do que vier é validado
public record DadosAtualizacaoEndereco(
		@Schema(example = "Rua das Palmeiras")
		@Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
		String logradouro,
		@Schema(example = "Zona 7")
		@Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
		String bairro,
		@Schema(description = "8 dígitos, sem traço", example = "87020000")
		@Pattern(regexp = "\\d{8}", message = "deve ter 8 dígitos, sem traço")
		String cep,
		@Schema(example = "Maringá")
		@Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
		String cidade,
		@Schema(example = "PR")
		@Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
		String uf,
		@Schema(description = "Texto vazio apaga o valor atual", example = "Sala 12")
		String complemento,
		@Schema(description = "Texto vazio apaga o valor atual", example = "250")
		String numero) {}
