package med.voll.api.cliente;

import med.voll.api.infra.CadastroDuplicadoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void cadastrar(DadosCadastroCliente dados) {
        validarDuplicidade(dados);
        repository.save(new Cliente(dados));
    }

    public Page<DadosListagemCliente> listar(Pageable paginacao) {
        return repository.findAllByAtivoTrue(paginacao).map(DadosListagemCliente::new);
    }

    // A checagem inclui inativos: a exclusão é lógica e a constraint unique do banco também os considera
    private void validarDuplicidade(DadosCadastroCliente dados) {
        if (repository.existsByCpf(dados.cpf())) {
            throw new CadastroDuplicadoException("cpf", "Já existe um cliente com este CPF (ele pode estar inativo).");
        }
        if (repository.existsByEmail(dados.email())) {
            throw new CadastroDuplicadoException("email", "Já existe um cliente com este e-mail (ele pode estar inativo).");
        }
    }
}
