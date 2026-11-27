# Data Model: Telas de clientes (tipos do front)

## Tipos da API (`api/tipos.ts`)

Espelham `DadosListagemCliente` e `DadosDetalhamentoCliente`:

```ts
interface ClienteListagem { id: number; nome: string; email: string; cpf: string }
interface ClienteDetalhe extends ClienteListagem {
  telefone: string; dataNascimento: string /* AAAA-MM-DD */; endereco: Endereco; ativo: boolean
}
interface ClienteCadastro {
  nome: string; email: string; telefone: string; cpf: string /* 11 dígitos */
  dataNascimento: string; endereco: Endereco
}
// Atualização: o mesmo MedicoAtualizacao, renomeado para CadastroAtualizacao {id, nome?, telefone?, endereco?}
```

## Estado dos formulários (`dominio/validacao.ts`)

```ts
type EnderecoFormulario = { [K in keyof Endereco]: string }   // já existia dentro de DadosFormulario
interface DadosFormularioMedico { nome; email; telefone; crm; especialidade: Especialidade | ''; endereco: EnderecoFormulario }
interface DadosFormularioCliente { nome; email; telefone; cpf /* só dígitos */; dataNascimento /* AAAA-MM-DD ou '' */; endereco: EnderecoFormulario }
```

## Validação local (as mesmas mensagens do servidor)

| Campo | Regra | Mensagem |
|---|---|---|
| `DadosFormularioCliente.cpf` | vazio | é obrigatório |
| | ≠ 11 dígitos | deve ter 11 dígitos, sem pontuação |
| | dígitos verificadores errados ou todos iguais | CPF inválido |
| `DadosFormularioCliente.dataNascimento` | vazio | é obrigatório |
| | hoje ou futuro | deve ser uma data no passado |
| nome, e-mail, telefone e endereço | iguais aos de médico (`validarEndereco` é compartilhado) | iguais |

Na edição de cliente, e-mail, CPF e data de nascimento não são validados, porque estão bloqueados.

## Configuração de área (`dominio/recursos.ts`)

```ts
interface AreaDeCadastro<L extends { id: number; nome: string }> {
  base: string                 // '/app/medicos' | '/app/clientes'
  singular: string; plural: string                      // 'médico' / 'médicos'
  api: { listarAtivos; listarInativos; excluir(id); reativar(id) }
  colunas: Coluna<L>[]
}
```

## Alterações para o PUT (`dominio/alteracoes.ts`)

`calcularAlteracoes(original: {id, nome, telefone, endereco}, atual: {nome, telefone, endereco})` devolve
`CadastroAtualizacao`. Serve aos dois, porque os campos editáveis são os mesmos.
