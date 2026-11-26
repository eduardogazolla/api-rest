package med.voll.api.cliente;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import med.voll.api.endereco.DadosAtualizacaoEndereco;

// E-mail, CPF e data de nascimento ficam de fora de propósito: identificam o cliente e não mudam
public record DadosAtualizacaoCliente(
        @Schema(description = "ID do cliente a atualizar", example = "1")
        @NotNull(message = "é obrigatório")
        Long id,
        @Schema(description = "Novo nome. Ausente ou null: não altera. Em branco: recusado", example = "Beatriz Lima")
        @Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
        @Size(max = 100, message = "deve ter no máximo {max} caracteres")
        String nome,
        @Schema(description = "Novo telefone. Ausente ou null: não altera. Em branco: recusado", example = "44911112222")
        @Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
        @Size(max = 20, message = "deve ter no máximo {max} caracteres")
        String telefone,
        @Schema(description = "Só os campos informados do endereço são alterados; o formato de cada um é validado")
        @Valid
        DadosAtualizacaoEndereco endereco) {

}
