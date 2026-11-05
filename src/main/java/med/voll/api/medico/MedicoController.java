package med.voll.api.medico;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("medicos")
@Tag(name = "Médicos", description = "Cadastro, listagem, atualização, exclusão lógica e reativação de médicos")
public class MedicoController {

	private final MedicoService service;

	public MedicoController(MedicoService service) {
		this.service = service;
	}

	@PostMapping
	@Operation(summary = "Cadastrar médico", description = "Cadastra um novo médico. Todo médico cadastrado nasce ativo.")
	@ApiResponse(responseCode = "200", description = "Médico cadastrado")
	@ApiResponse(responseCode = "400", description = "Dados inválidos: campo obrigatório vazio, e-mail inválido, CRM fora do padrão (4 a 6 dígitos) ou CEP fora do padrão (8 dígitos)")
	public void cadastrar(@RequestBody @Valid DadosCadastroMedico dados) {
		service.cadastrar(dados);
	}

	@GetMapping
	@Operation(summary = "Listar médicos ativos",
			description = "Lista paginada só com os médicos ativos. Sem parâmetros, devolve a página 0 com 10 médicos, ordenados por nome. "
					+ "No campo sort, informe uma propriedade por item, por exemplo: nome, crm,desc ou especialidade,asc.")
	@ApiResponse(responseCode = "200", description = "Página de médicos ativos")
	@ApiResponse(responseCode = "400", description = "Parâmetro sort inválido: propriedade inexistente ou em formato errado",
			content = @Content(schema = @Schema(implementation = TratadorDeErros.DadosErro.class)))
	public Page<DadosListagemMedico> listar(@ParameterObject @PageableDefault(size = 10, sort = {"nome"}) Pageable paginacao) {
		return service.listar(paginacao);
	}

	@PutMapping
	@Operation(summary = "Atualizar médico",
			description = "Atualização parcial: só nome, telefone e endereço podem mudar. Campo ausente ou null não é alterado. "
					+ "Nome ou telefone em branco são recusados.")
	@ApiResponse(responseCode = "200", description = "Médico atualizado")
	@ApiResponse(responseCode = "400", description = "Dados inválidos: id ausente, ou nome/telefone em branco")
	@ApiResponse(responseCode = "404", description = "Médico não encontrado")
	public void atualizar(@RequestBody @Valid DadosAtualizacaoMedico dados) {
		service.atualizar(dados);
	}

	@PatchMapping("/{id}/ativar")
	@Operation(summary = "Reativar médico", description = "Volta a marcar como ativo um médico excluído. Ele reaparece na listagem.")
	@ApiResponse(responseCode = "200", description = "Médico reativado")
	@ApiResponse(responseCode = "404", description = "Médico não encontrado")
	public void ativar(@Parameter(description = "ID do médico", example = "1") @PathVariable Long id) {
		service.ativar(id);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Excluir médico", description = "Exclusão lógica: o registro continua no banco, marcado como inativo, e some da listagem.")
	@ApiResponse(responseCode = "200", description = "Médico excluído (inativado)")
	@ApiResponse(responseCode = "404", description = "Médico não encontrado")
	public void excluir(@Parameter(description = "ID do médico", example = "1") @PathVariable Long id) {
		service.excluir(id);
	}
}
