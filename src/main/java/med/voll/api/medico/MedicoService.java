package med.voll.api.medico;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

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
        var medico = repository.findById(dados.id())
                .orElseThrow(() -> new EntityNotFoundException("Medico não encontrado: " + dados.id()));
        medico.atualizarInformacoes(dados);
    }

    @Transactional
    public void excluir(Long id) {
        // 1. Procuro o médico: findById devolve uma "caixa" (Optional)
        // 2. orElseThrow: se a caixa estiver vazia, lanço a exceção.
        //    O "() -> new ..." é uma lambda: só cria a exceção SE precisar.
        var medico = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médico não encontrado: " + id));

        medico.excluir();
    }
}