package med.voll.api.medico;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// @Service: "Spring, esta classe é um gerente de regras de negócio.
// Crie um objeto dela e entregue para quem precisar."
@Service
public class MedicoService {

    // "final" = depois de recebido, o repository nunca é trocado
    private final MedicoRepository repository;

    // INJEÇÃO PELO CONSTRUTOR (em vez de @Autowired no atributo):
    // o Spring vê que o construtor pede um MedicoRepository e entrega um.
    // Vantagem no teste: NÓS podemos entregar um repository FALSO aqui.
    public MedicoService(MedicoRepository repository) {
        this.repository = repository;
    }

    // O @Transactional veio do controller para cá,
    // porque é o Service quem mexe nos dados agora
    @Transactional
    public void cadastrar(DadosCadastroMedico dados) {
        repository.save(new Medico(dados));
    }

    public Page<DadosListagemMedico> listar(Pageable paginacao) {
        return repository.findAllByAtivoTrue(paginacao).map(DadosListagemMedico::new);
    }

    @Transactional
    public void atualizar(DadosAtualizacaoMedico dados) {
        var medico = repository.getReferenceById(dados.id());
        medico.atualizarInformacoes(dados);
    }

    @Transactional
    public void excluir(Long id) {
        var medico = repository.getReferenceById(id);
        medico.excluir();
    }
}