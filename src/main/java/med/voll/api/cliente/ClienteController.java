package med.voll.api.cliente;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.infra.TratadorDeErros;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("clientes")
@Tag(name = "Clientes", description = "Cadastro, listagem, atualização, exclusão lógica e reativação de clientes (pacientes)")
public class ClienteController {

	private final ClienteService service;

	public ClienteController(ClienteService service) {
		this.service = service;
	}

	@PostMapping
	@Operation(summary = "Cadastrar cliente", description = "Cadastra um novo cliente. Todo cliente cadastrado nasce ativo.")
	@ApiResponse(responseCode = "200", description = "Cliente cadastrado")
	@ApiResponse(responseCode = "400", description = "Dados inválidos: campo obrigatório vazio, e-mail inválido, CPF fora do padrão "
			+ "(11 dígitos, sem pontuação) ou com dígito verificador errado, data de nascimento hoje ou no futuro, ou data fora do formato AAAA-MM-DD. "
			+ "Corpo: lista de {campo, mensagem}",
			content = @Content(array = @ArraySchema(schema = @Schema(implementation = TratadorDeErros.DadosErroCampo.class))))
	@ApiResponse(responseCode = "409", description = "CPF ou e-mail já usado por outro cliente, mesmo inativo. Corpo: lista de {campo, mensagem}",
			content = @Content(array = @ArraySchema(schema = @Schema(implementation = TratadorDeErros.DadosErroCampo.class))))
	public void cadastrar(@RequestBody @Valid DadosCadastroCliente dados) {
		service.cadastrar(dados);
	}

	@GetMapping
	@Operation(summary = "Listar clientes ativos",
			description = "Lista paginada só com os clientes ativos. Sem parâmetros, devolve a página 0 com 10 clientes, ordenados por nome. "
					+ "No campo sort, informe uma propriedade por item, por exemplo: nome, cpf,desc ou email,asc.")
	@ApiResponse(responseCode = "200", description = "Página de clientes ativos")
	@ApiResponse(responseCode = "400", description = "Parâmetro sort inválido: propriedade inexistente ou em formato errado",
			content = @Content(schema = @Schema(implementation = TratadorDeErros.DadosErro.class)))
	public Page<DadosListagemCliente> listar(@ParameterObject @PageableDefault(size = 10, sort = {"nome"}) Pageable paginacao) {
		return service.listar(paginacao);
	}
}
