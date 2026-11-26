import type { CadastroAtualizacao, Endereco } from '../api/tipos'
import type { EnderecoFormulario } from './validacao'

// Médicos e clientes editam exatamente os mesmos campos: nome, telefone e endereço
interface Editaveis {
  nome: string
  telefone: string
}

const CAMPOS_DO_ENDERECO: (keyof Endereco)[] = ['logradouro', 'bairro', 'cep', 'cidade', 'uf', 'numero', 'complemento']

/**
 * Monta o corpo do PUT só com o que mudou. Para a API, campo ausente significa "não alterar";
 * texto vazio em número ou complemento significa "apagar".
 */
export function calcularAlteracoes(
  original: Editaveis & { id: number; endereco: Endereco },
  atual: Editaveis & { endereco: EnderecoFormulario },
): CadastroAtualizacao {
  const alteracoes: CadastroAtualizacao = { id: original.id }
  if (atual.nome !== original.nome) alteracoes.nome = atual.nome
  if (atual.telefone !== original.telefone) alteracoes.telefone = atual.telefone

  const endereco: Partial<Endereco> = {}
  for (const campo of CAMPOS_DO_ENDERECO) {
    if (atual.endereco[campo] !== (original.endereco[campo] ?? '')) endereco[campo] = atual.endereco[campo]
  }
  if (Object.keys(endereco).length > 0) alteracoes.endereco = endereco

  return alteracoes
}
