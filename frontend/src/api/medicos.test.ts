import { describe, expect, it } from 'vitest'
import { json, pagina, simularFetch } from '../test/fetchFalso'
import { listarAtivos } from './medicos'

describe('medicos', () => {
  it('deveMontarQueryDePaginaEOrdenacaoQuandoListarAtivos', async () => {
    const fetchFalso = simularFetch(() => json(pagina([])))

    await listarAtivos({ page: 1, sort: 'crm,desc' })

    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos?page=1&size=10&sort=crm%2Cdesc')
  })
})
