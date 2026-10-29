package med.voll.api.controller;

import jakarta.validation.Valid;
import med.voll.api.medico.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("medicos")
public class MedicoController {

	// O controller não conhece mais o repository: só fala com o Service
	private final MedicoService service;

	public MedicoController(MedicoService service) {
		this.service = service;
	}

	@PostMapping
	public void cadastrar(@RequestBody @Valid DadosCadastroMedico dados) {
		service.cadastrar(dados);     // "gerente, cadastra isso aqui"
	}

	@GetMapping
	public Page<DadosListagemMedico> listar(@PageableDefault(size = 10, sort = {"nome"}) Pageable paginacao) {
		return service.listar(paginacao);
	}

	@PutMapping
	public void atualizar(@RequestBody @Valid DadosAtualizacaoMedico dados) {
		service.atualizar(dados);
	}

	@PatchMapping("/{id}/ativar")
	public void ativar (@PathVariable Long id){
		service.ativar(id);
	}

	@DeleteMapping("/{id}")
	public void excluir(@PathVariable Long id) {
		service.excluir(id);
	}
}