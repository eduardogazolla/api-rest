import { requisitar } from './cliente'
import type { MedicoCadastro, MedicoListagem, Pagina } from './tipos'

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

export function cadastrarMedico(dados: MedicoCadastro): Promise<void> {
  return requisitar('/medicos', { method: 'POST', body: JSON.stringify(dados) })
}
