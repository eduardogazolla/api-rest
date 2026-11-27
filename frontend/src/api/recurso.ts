import { requisitar } from './cliente'
import type { CadastroAtualizacao, Pagina } from './tipos'

export interface ParametrosDeLista {
  page?: number
  sort?: string
}

const TAMANHO_DA_PAGINA = 10

function consulta({ page = 0, sort = 'nome,asc' }: ParametrosDeLista): string {
  return new URLSearchParams({ page: String(page), size: String(TAMANHO_DA_PAGINA), sort }).toString()
}

/** As mesmas 7 operações para cada recurso da API (/medicos e /clientes têm o mesmo contrato). */
export interface ApiDeCadastro<Listagem, Detalhe, Cadastro> {
  listarAtivos(parametros: ParametrosDeLista): Promise<Pagina<Listagem>>
  listarInativos(parametros: ParametrosDeLista): Promise<Pagina<Listagem>>
  detalhar(id: number): Promise<Detalhe>
  cadastrar(dados: Cadastro): Promise<void>
  atualizar(dados: CadastroAtualizacao): Promise<void>
  excluir(id: number): Promise<void>
  reativar(id: number): Promise<void>
}

export function criarApiDeCadastro<Listagem, Detalhe, Cadastro>(base: string): ApiDeCadastro<Listagem, Detalhe, Cadastro> {
  return {
    listarAtivos: (parametros) => requisitar(`${base}?${consulta(parametros)}`),
    listarInativos: (parametros) => requisitar(`${base}/inativos?${consulta(parametros)}`),
    detalhar: (id) => requisitar(`${base}/${id}`),
    cadastrar: (dados) => requisitar(base, { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (dados) => requisitar(base, { method: 'PUT', body: JSON.stringify(dados) }),
    excluir: (id) => requisitar(`${base}/${id}`, { method: 'DELETE' }),
    reativar: (id) => requisitar(`${base}/${id}/ativar`, { method: 'PATCH' }),
  }
}
