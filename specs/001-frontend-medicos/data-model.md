# Data Model: Interface web de gestão de médicos

As tabelas não mudam. A tabela `medicos` já tem `email` e `crm` como `unique` e a coluna `ativo`.
Abaixo estão os tipos que mudam ou são criados.

## Back-end (Java)

### `DadosDetalhamentoMedico` (novo, `medico/`)

```java
public record DadosDetalhamentoMedico(Long id, String nome, String email, String telefone,
        String crm, Especialidade especialidade, DadosEndereco endereco, Boolean ativo) {
    public DadosDetalhamentoMedico(Medico medico) { ... }
}
```

Usa o novo construtor `DadosEndereco(Endereco endereco)`.

### `DadosAtualizacaoEndereco` (novo, `endereco/`)

| Campo | Regra | Mensagem |
|---|---|---|
| logradouro, bairro, cidade, uf | `@Pattern(regexp = ".*\\S.*")`, `null` permitido | "não pode ficar em branco" |
| cep | `@Pattern(regexp = "\\d{8}")`, `null` permitido | "deve ter 8 dígitos, sem traço" |
| numero, complemento | livre, `""` apaga | – |

`Endereco.atualizarInformacoes(DadosAtualizacaoEndereco)` substitui a assinatura atual.

### `DadosAtualizacaoMedico` (alterado)

O campo `endereco` passa a ser `@Valid DadosAtualizacaoEndereco endereco`. O JSON continua igual.

### Mensagens explícitas (alterado)

`DadosCadastroMedico` e `DadosEndereco` ganham `message` em português:

| Anotação | Mensagem |
|---|---|
| `@NotBlank` | "é obrigatório" |
| `@NotNull` | "é obrigatório" |
| `@Email` | "deve ser um e-mail válido" |
| CRM `@Pattern` | "deve ter de 4 a 6 dígitos" |
| CEP `@Pattern` | "deve ter 8 dígitos, sem traço" |

### `CadastroDuplicadoException` (novo, `medico/`)

`RuntimeException` com `String campo` (`"crm"` ou `"email"`), além da mensagem.

### `TratadorDeErros.DadosErroCampo` (novo record interno)

`record DadosErroCampo(String campo, String mensagem)`. Tem um construtor a partir de
`FieldError` que usa `getField()` e `getDefaultMessage()`.

### `MedicoRepository` (alterado)

- `Page<Medico> findAllByAtivoFalse(Pageable paginacao)`
- `boolean existsByEmail(String email)`
- `boolean existsByCrm(String crm)`

### `MedicoService` (alterado)

- `DadosDetalhamentoMedico detalhar(Long id)` usa `buscarMedicoPorId`, então devolve 404 se o
  médico não existir.
- `Page<DadosListagemMedico> listarInativos(Pageable paginacao)`
- `cadastrar(dados)` checa primeiro `existsByCrm` e depois `existsByEmail`. Se algum existir,
  lança `CadastroDuplicadoException`.

## Front-end (TypeScript, `frontend/src/api/tipos.ts`)

```ts
export type Especialidade = "ORTOPEDIA" | "CARDIOLOGIA" | "GINECOLOGIA" | "DERMATOLOGIA";

export interface Endereco {
  logradouro: string; bairro: string; cep: string; cidade: string; uf: string;
  numero: string | null; complemento: string | null;
}

export interface MedicoListagem {
  id: number; nome: string; email: string; crm: string; especialidade: Especialidade;
}

export interface MedicoDetalhe extends MedicoListagem {
  telefone: string; endereco: Endereco; ativo: boolean;
}

export interface MedicoCadastro {
  nome: string; email: string; telefone: string; crm: string;
  especialidade: Especialidade; endereco: Endereco;
}

export interface MedicoAtualizacao {
  id: number; nome?: string; telefone?: string; endereco?: Partial<Endereco>;
}

export interface Pagina<T> {
  content: T[]; totalPages: number; totalElements: number; number: number; size: number;
}

export interface ErroCampo { campo: string | null; mensagem: string; }

export type TipoErroApi =
  | "validacao" | "conflito" | "requisicao" | "nao-encontrado"
  | "rede" | "sessao" | "servidor";
```

`ErroApi extends Error` com `tipo: TipoErroApi` e `campos: ErroCampo[]`.

### Regras de validação no navegador (`dominio/validacao.ts`)

`validarMedico(dados, modo: "cadastro" | "edicao"): Record<string, string>` devolve um objeto
`campo → mensagem` com as mesmas mensagens do servidor:

- No cadastro, são obrigatórios: nome, e-mail, telefone, CRM, especialidade e
  endereco.{logradouro, bairro, cep, cidade, uf}.
- Formatos:
  - e-mail no formato `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`;
  - CRM com `/^\d{4,6}$/`;
  - CEP com `/^\d{8}$/`;
  - UF em `UFS`.
- Na edição, valem as mesmas regras para nome, telefone e os campos do endereço. E-mail, CRM e
  especialidade não são validados porque estão bloqueados.

### Transições de estado do Médico

```
[cadastrado] ──► ativo ──excluir──► inativo ──reativar──► ativo
```

O cadastro sempre cria o médico ativo. Editar não muda a situação.
