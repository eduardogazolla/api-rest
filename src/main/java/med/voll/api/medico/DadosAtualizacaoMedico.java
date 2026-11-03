package med.voll.api.medico;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import med.voll.api.endereco.DadosEndereco;

public record DadosAtualizacaoMedico(
        @Schema(description = "ID do médico a atualizar", example = "1")
        @NotNull
        Long id,
        @Schema(description = "Novo nome. Ausente ou null: não altera. Em branco: recusado", example = "Ana Lima")
        @Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
        String nome,
        @Schema(description = "Novo telefone. Ausente ou null: não altera. Em branco: recusado", example = "44988887777")
        @Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
        String telefone,
        @Schema(description = "Só os campos informados do endereço são alterados")
        DadosEndereco endereco) {

}
