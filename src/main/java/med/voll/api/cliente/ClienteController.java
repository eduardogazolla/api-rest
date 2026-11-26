package med.voll.api.cliente;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.infra.TratadorDeErros;
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
}
