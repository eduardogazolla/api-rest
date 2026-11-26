package med.voll.api.infra;

import lombok.Getter;

@Getter
public class CadastroDuplicadoException extends RuntimeException {

    private final String campo;

    public CadastroDuplicadoException(String campo, String mensagem) {
        super(mensagem);
        this.campo = campo;
    }
}
