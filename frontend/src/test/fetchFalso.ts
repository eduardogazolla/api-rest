import { vi } from 'vitest'
import type { ClienteListagem, MedicoListagem, Pagina } from '../api/tipos'

type Tratador = (url: string, init: RequestInit) => Response | Promise<Response>

export function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })
}

export function vazio(status = 200): Response {
  return new Response(null, { status })
}

/** Substitui o fetch global; cada chamada é respondida pelo tratador. */
export function simularFetch(tratador: Tratador) {
  const fetchFalso = vi.fn((url: string, init: RequestInit) => Promise.resolve(tratador(url, init)))
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

export function pagina(content: MedicoListagem[], numero = 0, totalPages = 1): Pagina<MedicoListagem> {
  return { content, number: numero, totalPages, totalElements: content.length + numero * 10, size: 10 }
}

export const ana: MedicoListagem = {
  id: 1, nome: 'Ana Souza', email: 'ana@voll.med', crm: '123456', especialidade: 'CARDIOLOGIA',
}
export const bruno: MedicoListagem = {
  id: 2, nome: 'Bruno Lima', email: 'bruno@voll.med', crm: '4321', especialidade: 'ORTOPEDIA',
}

export const beatriz: ClienteListagem = { id: 11, nome: 'Beatriz Rocha', email: 'beatriz@exemplo.com', cpf: '52998224725' }
export const caio: ClienteListagem = { id: 12, nome: 'Caio Nunes', email: 'caio@exemplo.com', cpf: '11144477735' }

export function paginaDeClientes(content: ClienteListagem[], numero = 0, totalPages = 1): Pagina<ClienteListagem> {
  return { content, number: numero, totalPages, totalElements: content.length + numero * 10, size: 10 }
}
