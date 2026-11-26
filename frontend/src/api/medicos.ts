import type { DadosFormulario } from '../dominio/validacao'
import { requisitar } from './cliente'
import type { Endereco, MedicoAtualizacao, MedicoCadastro, MedicoDetalhe, MedicoListagem, Pagina } from './tipos'

export interface ParametrosDeLista {
  page?: number
  sort?: string
}

export const TAMANHO_DA_PAGINA = 10

function consulta({ page = 0, sort = 'nome,asc' }: ParametrosDeLista): string {
  return new URLSearchParams({ page: String(page), size: String(TAMANHO_DA_PAGINA), sort }).toString()
}

export function listarAtivos(parametros: ParametrosDeLista): Promise<Pagina<MedicoListagem>> {
  return requisitar(`/medicos?${consulta(parametros)}`)
}

export function detalharMedico(id: number): Promise<MedicoDetalhe> {
  return requisitar(`/medicos/${id}`)
}

export function cadastrarMedico(dados: MedicoCadastro): Promise<void> {
  return requisitar('/medicos', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarMedico(dados: MedicoAtualizacao): Promise<void> {
  return requisitar('/medicos', { method: 'PUT', body: JSON.stringify(dados) })
}

const CAMPOS_DO_ENDERECO: (keyof Endereco)[] = ['logradouro', 'bairro', 'cep', 'cidade', 'uf', 'numero', 'complemento']

/**
 * Monta o corpo do PUT só com o que mudou. Para a API, campo ausente significa "não alterar";
 * texto vazio em número ou complemento significa "apagar".
 */
export function calcularAlteracoes(original: MedicoDetalhe, atual: DadosFormulario): MedicoAtualizacao {
  const alteracoes: MedicoAtualizacao = { id: original.id }
  if (atual.nome !== original.nome) alteracoes.nome = atual.nome
  if (atual.telefone !== original.telefone) alteracoes.telefone = atual.telefone

  const endereco: Partial<Endereco> = {}
  for (const campo of CAMPOS_DO_ENDERECO) {
    if (atual.endereco[campo] !== (original.endereco[campo] ?? '')) endereco[campo] = atual.endereco[campo]
  }
  if (Object.keys(endereco).length > 0) alteracoes.endereco = endereco

  return alteracoes
}
