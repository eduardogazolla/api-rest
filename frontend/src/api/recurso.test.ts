import { describe, expect, it } from 'vitest'
import { json, pagina, simularFetch, vazio } from '../test/fetchFalso'
import { criarApiDeCadastro } from './recurso'
import type { MedicoCadastro, MedicoDetalhe, MedicoListagem } from './tipos'

const api = criarApiDeCadastro<MedicoListagem, MedicoDetalhe, MedicoCadastro>('/medicos')

describe('criarApiDeCadastro', () => {
  it('deveMontarQueryDePaginaEOrdenacaoQuandoListarAtivos', async () => {
    const fetchFalso = simularFetch(() => json(pagina([])))

    await api.listarAtivos({ page: 1, sort: 'crm,desc' })

    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos?page=1&size=10&sort=crm%2Cdesc')
  })

  it('deveChamarRotaDeInativosQuandoListarInativos', async () => {
    const fetchFalso = simularFetch(() => json(pagina([])))
    await api.listarInativos({ sort: 'crm,desc' })
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/inativos?page=0&size=10&sort=crm%2Cdesc')
  })

  it('deveEnviarPostComJsonQuandoCadastrar', async () => {
    const fetchFalso = simularFetch(() => vazio())
    const dados: MedicoCadastro = {
      nome: 'Ana', email: 'ana@voll.med', telefone: '44999990000', crm: '1234', especialidade: 'ORTOPEDIA',
      endereco: { logradouro: 'Rua A', bairro: 'Centro', cep: '87000000', cidade: 'Maringá', uf: 'PR', numero: null, complemento: null },
    }

    await api.cadastrar(dados)

    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('/medicos')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual(dados)
  })

  it('deveBuscarDetalheQuandoDetalhar', async () => {
    const fetchFalso = simularFetch(() => json({ id: 7 }))

    await expect(api.detalhar(7)).resolves.toEqual({ id: 7 })
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/7')
  })

  it('deveEnviarPutComIdQuandoAtualizar', async () => {
    const fetchFalso = simularFetch(() => vazio())

    await api.atualizar({ id: 7, telefone: '44911112222' })

    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('/medicos')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(String(init.body))).toEqual({ id: 7, telefone: '44911112222' })
  })

  it('deveEnviarDeleteQuandoExcluir', async () => {
    const fetchFalso = simularFetch(() => vazio())
    await api.excluir(7)
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/7')
    expect(fetchFalso.mock.calls[0][1].method).toBe('DELETE')
  })

  it('deveEnviarPatchQuandoReativar', async () => {
    const fetchFalso = simularFetch(() => vazio())
    await api.reativar(7)
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/7/ativar')
    expect(fetchFalso.mock.calls[0][1].method).toBe('PATCH')
  })
})
