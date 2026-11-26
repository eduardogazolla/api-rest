import { describe, expect, it } from 'vitest'
import { clienteVazio, hojeNoFormatoIso, medicoVazio, validarCliente, validarMedico, type DadosFormularioCliente, type DadosFormularioMedico } from './validacao'

function cadastroValido(): DadosFormularioMedico {
  return {
    nome: 'Ana Souza', email: 'ana@voll.med', telefone: '44999990000', crm: '123456',
    especialidade: 'CARDIOLOGIA',
    endereco: { logradouro: 'Rua das Flores', bairro: 'Centro', cep: '87000000', cidade: 'Maringá', uf: 'PR', numero: '', complemento: '' },
  }
}

describe('validarMedico (cadastro)', () => {
  it('deveExigirTodosOsObrigatoriosQuandoCadastroVazio', () => {
    const erros = validarMedico(medicoVazio(), 'cadastro')
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

function clienteValido(): DadosFormularioCliente {
  return {
    nome: 'Beatriz Rocha', email: 'beatriz@exemplo.com', telefone: '44999998888', cpf: '52998224725',
    dataNascimento: '1990-05-20',
    endereco: { logradouro: 'Av. Brasil', bairro: 'Centro', cep: '87013000', cidade: 'Maringá', uf: 'PR', numero: '', complemento: '' },
  }
}

describe('validarCliente (cadastro)', () => {
  it('deveExigirCpfEDataDeNascimento', () => {
    const erros = validarCliente(clienteVazio(), 'cadastro')
    expect(erros.cpf).toBe('é obrigatório')
    expect(erros.dataNascimento).toBe('é obrigatório')
    expect(erros.nome).toBe('é obrigatório')
  })

  it('deveRecusarCpfIncompleto', () => {
    expect(validarCliente({ ...clienteValido(), cpf: '5299822472' }, 'cadastro').cpf).toBe('deve ter 11 dígitos, sem pontuação')
  })

  it('deveRecusarCpfComDigitoErrado', () => {
    expect(validarCliente({ ...clienteValido(), cpf: '52998224724' }, 'cadastro').cpf).toBe('CPF inválido')
  })

  it('deveRecusarDataDeNascimentoHojeOuFutura', () => {
    expect(validarCliente({ ...clienteValido(), dataNascimento: hojeNoFormatoIso() }, 'cadastro').dataNascimento)
      .toBe('deve ser uma data no passado')
    expect(validarCliente({ ...clienteValido(), dataNascimento: '2999-01-01' }, 'cadastro').dataNascimento)
      .toBe('deve ser uma data no passado')
  })

  it('deveAceitarClienteValido', () => {
    expect(validarCliente(clienteValido(), 'cadastro')).toEqual({})
  })

  it('naoDeveValidarCamposBloqueadosNaEdicao', () => {
    const dados = { ...clienteValido(), cpf: '', dataNascimento: '', email: '' }
    expect(validarCliente(dados, 'edicao')).toEqual({})
  })
})

describe('validarCliente (ano com mais de 4 dígitos)', () => {
  it('deveRecusarAnoComSeisDigitosComoDataFutura', () => {
    // O <input type="date"> do Chrome aceita anos de até 6 dígitos; comparar como texto deixaria passar
    expect(validarCliente({ ...clienteValido(), dataNascimento: '202512-01-01' }, 'cadastro').dataNascimento)
      .toBe('deve ser uma data no passado')
  })
})
