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
        validarDuplicidade(dados);
        repository.save(new Medico(dados));
    }

    // A checagem inclui inativos: a exclusão é lógica e a constraint unique do banco também os considera
    private void validarDuplicidade(DadosCadastroMedico dados) {
        if (repository.existsByCrm(dados.crm())) {
            throw new CadastroDuplicadoException("crm", "Já existe um médico com este CRM (ele pode estar inativo).");
        }
        if (repository.existsByEmail(dados.email())) {
            throw new CadastroDuplicadoException("email", "Já existe um médico com este e-mail (ele pode estar inativo).");
        }
    }

    public Page<DadosListagemMedico> listar(Pageable paginacao) {
        return repository.findAllByAtivoTrue(paginacao).map(DadosListagemMedico::new);
    }

    public Page<DadosListagemMedico> listarInativos(Pageable paginacao) {
        return repository.findAllByAtivoFalse(paginacao).map(DadosListagemMedico::new);
    }

    public DadosDetalhamentoMedico detalhar(Long id) {
        return new DadosDetalhamentoMedico(buscarMedicoPorId(id));
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