package med.voll.api.medico;

import med.voll.api.endereco.DadosEndereco;

public record DadosDetalhamentoMedico(Long id, String nome, String email, String telefone, String crm,
		Especialidade especialidade, DadosEndereco endereco, Boolean ativo) {

	public DadosDetalhamentoMedico(Medico medico) {
		this(medico.getId(), medico.getNome(), medico.getEmail(), medico.getTelefone(), medico.getCrm(),
				medico.getEspecialidade(), new DadosEndereco(medico.getEndereco()), medico.getAtivo());
	}
}
