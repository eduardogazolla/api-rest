import { describe, expect, it } from 'vitest'
import { json, pagina, simularFetch, vazio } from '../test/fetchFalso'
import { formularioVazio, type DadosFormulario } from '../dominio/validacao'
import {
  atualizarMedico, cadastrarMedico, calcularAlteracoes, detalharMedico, excluirMedico, listarAtivos, listarInativos,
  reativarMedico,
} from './medicos'
import type { MedicoCadastro, MedicoDetalhe } from './tipos'

const original: MedicoDetalhe = {
  id: 7, nome: 'Ana Souza', email: 'ana@voll.med', telefone: '44999990000', crm: '123456',
  especialidade: 'CARDIOLOGIA', ativo: true,
  endereco: { logradouro: 'Rua das Flores', bairro: 'Centro', cep: '87000000', cidade: 'Maringá', uf: 'PR', numero: '100', complemento: null },
}

function formularioDe(medico: MedicoDetalhe): DadosFormulario {
  const vazio = formularioVazio()
  return {
    ...vazio, nome: medico.nome, email: medico.email, telefone: medico.telefone, crm: medico.crm,
    especialidade: medico.especialidade,
    endereco: { ...medico.endereco, numero: medico.endereco.numero ?? '', complemento: medico.endereco.complemento ?? '' },
  }
}

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

  it('deveBuscarDetalheQuandoDetalharMedico', async () => {
    const fetchFalso = simularFetch(() => json(original))

    await expect(detalharMedico(7)).resolves.toEqual(original)
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/7')
  })

  it('deveEnviarPutComIdQuandoAtualizar', async () => {
    const fetchFalso = simularFetch(() => vazio())

    await atualizarMedico({ id: 7, telefone: '44911112222' })

    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('/medicos')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(String(init.body))).toEqual({ id: 7, telefone: '44911112222' })
  })
})

describe('medicos (inativos, exclusão e reativação)', () => {
  it('deveChamarRotaDeInativosQuandoListarInativos', async () => {
    const fetchFalso = simularFetch(() => json(pagina([])))
    await listarInativos({ sort: 'crm,desc' })
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/inativos?page=0&size=10&sort=crm%2Cdesc')
  })

  it('deveEnviarDeleteQuandoExcluir', async () => {
    const fetchFalso = simularFetch(() => vazio())
    await excluirMedico(7)
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/7')
    expect(fetchFalso.mock.calls[0][1].method).toBe('DELETE')
  })

  it('deveEnviarPatchQuandoReativar', async () => {
    const fetchFalso = simularFetch(() => vazio())
    await reativarMedico(7)
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos/7/ativar')
    expect(fetchFalso.mock.calls[0][1].method).toBe('PATCH')
  })
})

describe('calcularAlteracoes', () => {
  it('deveIncluirSoCamposAlterados', () => {
    const atual = formularioDe(original)
    atual.telefone = '44911112222'
    atual.endereco.cidade = 'Cianorte'

    expect(calcularAlteracoes(original, atual)).toEqual({
      id: 7, telefone: '44911112222', endereco: { cidade: 'Cianorte' },
    })
  })

  it('deveEnviarTextoVazioQuandoNumeroForApagado', () => {
    const atual = formularioDe(original)
    atual.endereco.numero = ''

    expect(calcularAlteracoes(original, atual)).toEqual({ id: 7, endereco: { numero: '' } })
  })

  it('deveOmitirEnderecoQuandoNadaMudar', () => {
    expect(calcularAlteracoes(original, formularioDe(original))).toEqual({ id: 7 })
  })
})
