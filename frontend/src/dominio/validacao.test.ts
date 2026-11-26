import { describe, expect, it } from 'vitest'
import { formularioVazio, validarMedico, type DadosFormulario } from './validacao'

function cadastroValido(): DadosFormulario {
  return {
    nome: 'Ana Souza', email: 'ana@voll.med', telefone: '44999990000', crm: '123456',
    especialidade: 'CARDIOLOGIA',
    endereco: { logradouro: 'Rua das Flores', bairro: 'Centro', cep: '87000000', cidade: 'Maringá', uf: 'PR', numero: '', complemento: '' },
  }
}

describe('validarMedico (cadastro)', () => {
  it('deveExigirTodosOsObrigatoriosQuandoCadastroVazio', () => {
    const erros = validarMedico(formularioVazio(), 'cadastro')
    expect(Object.keys(erros).sort()).toEqual([
      'crm', 'email', 'endereco.bairro', 'endereco.cep', 'endereco.cidade', 'endereco.logradouro',
      'endereco.uf', 'especialidade', 'nome', 'telefone',
    ])
    expect(erros.nome).toBe('é obrigatório')
  })

  it('deveRecusarCrmForaDoPadrao', () => {
    expect(validarMedico({ ...cadastroValido(), crm: '12' }, 'cadastro').crm).toBe('deve ter de 4 a 6 dígitos')
    expect(validarMedico({ ...cadastroValido(), crm: '1234567' }, 'cadastro').crm).toBe('deve ter de 4 a 6 dígitos')
  })

  it('deveRecusarCepComTraco', () => {
    const dados = cadastroValido()
    dados.endereco.cep = '87000-000'
    expect(validarMedico(dados, 'cadastro')['endereco.cep']).toBe('deve ter 8 dígitos, sem traço')
  })

  it('deveRecusarEmailInvalido', () => {
    expect(validarMedico({ ...cadastroValido(), email: 'ana@' }, 'cadastro').email).toBe('deve ser um e-mail válido')
  })

  it('deveRecusarUfForaDaLista', () => {
    const dados = cadastroValido()
    dados.endereco.uf = 'XX'
    expect(validarMedico(dados, 'cadastro')['endereco.uf']).toBe('escolha uma UF da lista')
  })

  it('deveAceitarCadastroValidoSemNumeroEComplemento', () => {
    expect(validarMedico(cadastroValido(), 'cadastro')).toEqual({})
  })
})
