package med.voll.api.medico;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicoService {

    private final MedicoRepository repository;

    public MedicoService(MedicoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void cadastrar(DadosCadastroMedico dados) {
        repository.save(new Medico(dados));
    }

    public Page<DadosListagemMedico> listar(Pageable paginacao) {
        return repository.findAllByAtivoTrue(paginacao).map(DadosListagemMedico::new);
    }

    @Transactional
    public void atualizar(DadosAtualizacaoMedico dados) {
        buscarMedicoPorId(dados.id()).atualizarInformacoes(dados);
    }

    @Transactional
    public void excluir(Long id) {
        buscarMedicoPorId(id).excluir();
    }

    @Transactional
    public void ativar(Long id){
        buscarMedicoPorId(id).ativar();
    }

    private Medico buscarMedicoPorId(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médico não encontrado: " + id));
    }
}