import { describe, expect, it } from 'vitest'
import type { MedicoDetalhe } from '../api/tipos'
import { calcularAlteracoes } from './alteracoes'
import type { EnderecoFormulario } from './validacao'

const original: MedicoDetalhe = {
  id: 7, nome: 'Ana Souza', email: 'ana@voll.med', telefone: '44999990000', crm: '123456',
  especialidade: 'CARDIOLOGIA', ativo: true,
  endereco: { logradouro: 'Rua das Flores', bairro: 'Centro', cep: '87000000', cidade: 'Maringá', uf: 'PR', numero: '100', complemento: null },
}

function editaveisDe(cadastro: MedicoDetalhe): { nome: string; telefone: string; endereco: EnderecoFormulario } {
  return {
    nome: cadastro.nome,
    telefone: cadastro.telefone,
    endereco: { ...cadastro.endereco, numero: cadastro.endereco.numero ?? '', complemento: cadastro.endereco.complemento ?? '' },
  }
}

describe('calcularAlteracoes', () => {
  it('deveIncluirSoCamposAlterados', () => {
    const atual = editaveisDe(original)
    atual.telefone = '44911112222'
    atual.endereco.cidade = 'Cianorte'

    expect(calcularAlteracoes(original, atual)).toEqual({
      id: 7, telefone: '44911112222', endereco: { cidade: 'Cianorte' },
    })
  })

  it('deveEnviarTextoVazioQuandoNumeroForApagado', () => {
    const atual = editaveisDe(original)
    atual.endereco.numero = ''

    expect(calcularAlteracoes(original, atual)).toEqual({ id: 7, endereco: { numero: '' } })
  })

  it('deveOmitirEnderecoQuandoNadaMudar', () => {
    expect(calcularAlteracoes(original, editaveisDe(original))).toEqual({ id: 7 })
  })
})
