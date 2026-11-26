import { describe, expect, it } from 'vitest'
import { json, pagina, simularFetch, vazio } from '../test/fetchFalso'
import { cadastrarMedico, listarAtivos } from './medicos'
import type { MedicoCadastro } from './tipos'

describe('medicos', () => {
  it('deveMontarQueryDePaginaEOrdenacaoQuandoListarAtivos', async () => {
    const fetchFalso = simularFetch(() => json(pagina([])))

    await listarAtivos({ page: 1, sort: 'crm,desc' })

    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos?page=1&size=10&sort=crm%2Cdesc')
  })

  it('deveEnviarPostComJsonQuandoCadastrar', async () => {
    const fetchFalso = simularFetch(() => vazio())
    const dados: MedicoCadastro = {
      nome: 'Ana', email: 'ana@voll.med', telefone: '44999990000', crm: '1234', especialidade: 'ORTOPEDIA',
      endereco: { logradouro: 'Rua A', bairro: 'Centro', cep: '87000000', cidade: 'Maringá', uf: 'PR', numero: null, complemento: null },
    }

    await cadastrarMedico(dados)

    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('/medicos')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual(dados)
  })
})
