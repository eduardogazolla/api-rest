package med.voll.api.cliente;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import med.voll.api.endereco.Endereco;

import java.time.LocalDate;

@Table(name = "clientes")
@Entity(name = "Cliente")
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Cliente {

	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String nome;
	private String email;
	private String telefone;
	private String cpf;
	private LocalDate dataNascimento;

	@Embedded
	private Endereco endereco;

	private Boolean ativo;

	public Cliente(DadosCadastroCliente dados) {
		this.ativo = true;
		this.nome = dados.nome();
		this.email = dados.email();
		this.telefone = dados.telefone();
		this.cpf = dados.cpf();
		this.dataNascimento = dados.dataNascimento();
		this.endereco = new Endereco(dados.endereco());
	}

	public void excluir() {
		this.ativo = false; // exclusão lógica: o registro é mantido no banco
	}

	public void ativar() {
		this.ativo = true;
	}
}
