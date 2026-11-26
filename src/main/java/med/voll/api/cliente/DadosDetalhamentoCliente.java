package med.voll.api.cliente;

import med.voll.api.endereco.DadosEndereco;

import java.time.LocalDate;

public record DadosDetalhamentoCliente(Long id, String nome, String email, String telefone, String cpf,
		LocalDate dataNascimento, DadosEndereco endereco, Boolean ativo) {

	public DadosDetalhamentoCliente(Cliente cliente) {
		this(cliente.getId(), cliente.getNome(), cliente.getEmail(), cliente.getTelefone(), cliente.getCpf(),
				cliente.getDataNascimento(), new DadosEndereco(cliente.getEndereco()), cliente.getAtivo());
	}
}
