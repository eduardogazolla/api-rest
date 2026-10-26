package med.voll.api.controller;

import jakarta.validation.Valid;
import med.voll.api.endereco.Endereco;
import med.voll.api.medico.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // dizendo que é um controller rest
@RequestMapping("medicos") // a rota que será chamada nas requisições
public class MedicoController {
	@Autowired // para chamar o JpaRepository
	private MedicoRepository repository;

	@PostMapping // rota post
	@Transactional
	public void cadastrar(@RequestBody @Valid DadosCadastroMedico dados){
		repository.save(new Medico(dados));
	}

	@GetMapping //rota get
	public Page<DadosListagemMedico> listar(@PageableDefault(size = 10, sort = {"nome"}) Pageable paginacao){
		return repository.findAllByAtivoTrue(paginacao).map(DadosListagemMedico::new);
	}

	@PutMapping //rota put
	@Transactional
	public void atualizar(@RequestBody @Valid DadosAtualizacaoMedico dados){
		var medico = repository.getReferenceById(dados.id());
		medico.atualizarInformacoes(dados); 
	}

	@DeleteMapping("/{id}") // rota delete
	@Transactional
	public void excluir(@PathVariable Long id){
		var medico = repository.getReferenceById(id);
		medico.excluir();
	}

	@PatchMapping("/{id}/ativar")
	@Transactional
	public void ativar(@PathVariable Long id){
		var medico = repository.getReferenceById(id);
		medico.ativar();
	}
}
