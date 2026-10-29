package med.voll.api.medico;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import med.voll.api.endereco.DadosEndereco;

public record DadosAtualizacaoMedico(
        @NotNull
        Long id,
        @Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
        String nome,
        @Pattern(regexp = ".*\\S.*", message = "não pode ficar em branco")
        String telefone,
        DadosEndereco endereco) {

}
