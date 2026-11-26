import type { Endereco, Especialidade } from '../api/tipos'
import { UFS } from './constantes'
import { cpfValido } from './cpf'

export type ModoFormulario = 'cadastro' | 'edicao'

/** No formulário tudo é texto, inclusive o que é opcional. */
export type EnderecoFormulario = { [K in keyof Endereco]: string }

export interface DadosFormularioMedico {
  nome: string
  email: string
  telefone: string
  crm: string
  especialidade: Especialidade | ''
  endereco: EnderecoFormulario
}

export type ErrosDoFormulario = Record<string, string>

export function enderecoVazio(): EnderecoFormulario {
  return { logradouro: '', bairro: '', cep: '', cidade: '', uf: '', numero: '', complemento: '' }
}

export function medicoVazio(): DadosFormularioMedico {
  return { nome: '', email: '', telefone: '', crm: '', especialidade: '', endereco: enderecoVazio() }
}

// As mensagens são as mesmas do servidor (anotações dos DTOs Java), para a pessoa ver o mesmo texto
// venha o erro do navegador ou da API
const OBRIGATORIO = 'é obrigatório'
const EM_BRANCO = 'não pode ficar em branco'

const vazio = (valor: string) => valor.trim() === ''
const mensagemDeVazio = (modo: ModoFormulario) => (modo === 'cadastro' ? OBRIGATORIO : EM_BRANCO)

/** Logradouro, bairro, cidade, CEP e UF obrigatórios; número e complemento opcionais. */
export function validarEndereco(endereco: EnderecoFormulario, modo: ModoFormulario): ErrosDoFormulario {
  const erros: ErrosDoFormulario = {}
  for (const campo of ['logradouro', 'bairro', 'cidade'] as const) {
    if (vazio(endereco[campo])) erros[`endereco.${campo}`] = mensagemDeVazio(modo)
  }

  if (vazio(endereco.cep)) erros['endereco.cep'] = mensagemDeVazio(modo)
  else if (!/^\d{8}$/.test(endereco.cep)) erros['endereco.cep'] = 'deve ter 8 dígitos, sem traço'

  if (vazio(endereco.uf)) erros['endereco.uf'] = mensagemDeVazio(modo)
  else if (!UFS.includes(endereco.uf)) erros['endereco.uf'] = 'escolha uma UF da lista'

  return erros
}

interface DadosComuns {
  nome: string
  email: string
  telefone: string
  endereco: EnderecoFormulario
}

/**
 * O que médico e cliente têm em comum: nome, telefone e endereço sempre; e-mail só no cadastro,
 * porque na edição ele fica bloqueado.
 */
export function validarDadosComuns(dados: DadosComuns, modo: ModoFormulario): ErrosDoFormulario {
  const erros: ErrosDoFormulario = validarEndereco(dados.endereco, modo)
  if (vazio(dados.nome)) erros.nome = mensagemDeVazio(modo)
  if (vazio(dados.telefone)) erros.telefone = mensagemDeVazio(modo)

  if (modo === 'cadastro') {
    if (vazio(dados.email)) erros.email = OBRIGATORIO
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.email = 'deve ser um e-mail válido'
  }
  return erros
}

/**
 * Devolve um objeto campo → mensagem, com as chaves no mesmo formato do servidor (ex.: "endereco.cep").
 * Na edição, CRM e especialidade estão bloqueados e não são validados.
 */
export function validarMedico(dados: DadosFormularioMedico, modo: ModoFormulario): ErrosDoFormulario {
  const erros = validarDadosComuns(dados, modo)
  if (modo === 'cadastro') {
    if (vazio(dados.crm)) erros.crm = OBRIGATORIO
    else if (!/^\d{4,6}$/.test(dados.crm)) erros.crm = 'deve ter de 4 a 6 dígitos'

    if (dados.especialidade === '') erros.especialidade = OBRIGATORIO
  }
  return erros
}

export interface DadosFormularioCliente {
  nome: string
  email: string
  telefone: string
  /** Só os dígitos; a máscara é só de exibição. */
  cpf: string
  /** AAAA-MM-DD, como o <input type="date"> entrega; vazio enquanto não escolhida. */
  dataNascimento: string
  endereco: EnderecoFormulario
}

export function clienteVazio(): DadosFormularioCliente {
  return { nome: '', email: '', telefone: '', cpf: '', dataNascimento: '', endereco: enderecoVazio() }
}

/** A data de hoje no fuso do navegador, no mesmo formato do <input type="date">. */
export function hojeNoFormatoIso(): string {
  const agora = new Date()
  const doisDigitos = (n: number) => String(n).padStart(2, '0')
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`
}

/** Na edição, e-mail, CPF e data de nascimento estão bloqueados e não são validados. */
export function validarCliente(dados: DadosFormularioCliente, modo: ModoFormulario): ErrosDoFormulario {
  const erros = validarDadosComuns(dados, modo)
  if (modo === 'cadastro') {
    if (vazio(dados.cpf)) erros.cpf = OBRIGATORIO
    else if (!/^\d{11}$/.test(dados.cpf)) erros.cpf = 'deve ter 11 dígitos, sem pontuação'
    else if (!cpfValido(dados.cpf)) erros.cpf = 'CPF inválido'

    // Datas AAAA-MM-DD comparam certo como texto
    if (vazio(dados.dataNascimento)) erros.dataNascimento = OBRIGATORIO
    else if (dados.dataNascimento >= hojeNoFormatoIso()) erros.dataNascimento = 'deve ser uma data no passado'
  }
  return erros
}
