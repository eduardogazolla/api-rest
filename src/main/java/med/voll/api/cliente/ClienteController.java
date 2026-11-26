package med.voll.api.cliente;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

	@GetMapping("/inativos")
	@Operation(summary = "Listar clientes inativos",
			description = "Lista paginada só com os clientes excluídos (inativos), que podem ser reativados. "
					+ "Mesmos parâmetros de paginação e ordenação de GET /clientes.")
	@ApiResponse(responseCode = "200", description = "Página de clientes inativos")
	@ApiResponse(responseCode = "400", description = "Parâmetro sort inválido: propriedade inexistente ou em formato errado",
			content = @Content(schema = @Schema(implementation = TratadorDeErros.DadosErro.class)))
	public Page<DadosListagemCliente> listarInativos(@ParameterObject @PageableDefault(size = 10, sort = {"nome"}) Pageable paginacao) {
		return service.listarInativos(paginacao);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Detalhar cliente",
			description = "Todos os dados do cliente, inclusive telefone, data de nascimento, endereço e situação. Também encontra clientes inativos.")
	@ApiResponse(responseCode = "200", description = "Dados completos do cliente")
	@ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
	public DadosDetalhamentoCliente detalhar(@Parameter(description = "ID do cliente", example = "1") @PathVariable Long id) {
		return service.detalhar(id);
	}

	@PutMapping
	@Operation(summary = "Atualizar cliente",
			description = "Atualização parcial: só nome, telefone e endereço podem mudar. Campo ausente ou null não é alterado. "
					+ "Nome ou telefone em branco são recusados. E-mail, CPF e data de nascimento não mudam.")
	@ApiResponse(responseCode = "200", description = "Cliente atualizado")
	@ApiResponse(responseCode = "400", description = "Dados inválidos: id ausente, nome/telefone em branco, "
			+ "logradouro/bairro/cidade/UF em branco ou CEP fora do padrão (8 dígitos). Corpo: lista de {campo, mensagem}",
			content = @Content(array = @ArraySchema(schema = @Schema(implementation = TratadorDeErros.DadosErroCampo.class))))
	@ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
	public void atualizar(@RequestBody @Valid DadosAtualizacaoCliente dados) {
		service.atualizar(dados);
	}

	@PatchMapping("/{id}/ativar")
	@Operation(summary = "Reativar cliente", description = "Volta a marcar como ativo um cliente excluído. Ele reaparece na listagem.")
	@ApiResponse(responseCode = "200", description = "Cliente reativado")
	@ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
	public void ativar(@Parameter(description = "ID do cliente", example = "1") @PathVariable Long id) {
		service.ativar(id);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Excluir cliente", description = "Exclusão lógica: o registro continua no banco, marcado como inativo, e some da listagem.")
	@ApiResponse(responseCode = "200", description = "Cliente excluído (inativado)")
	@ApiResponse(responseCode = "404", description = "Cliente não encontrado", content = @Content)
	public void excluir(@Parameter(description = "ID do cliente", example = "1") @PathVariable Long id) {
		service.excluir(id);
	}
}
