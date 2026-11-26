import type { Endereco, Especialidade } from '../api/tipos'
import { UFS } from './constantes'

/** Estado do formulário: tudo texto, inclusive o que é opcional, e especialidade pode estar vazia. */
export interface DadosFormulario {
  nome: string
  email: string
  telefone: string
  crm: string
  especialidade: Especialidade | ''
  endereco: { [K in keyof Endereco]: string }
}

export type ErrosDoFormulario = Record<string, string>

export function formularioVazio(): DadosFormulario {
  return {
    nome: '', email: '', telefone: '', crm: '', especialidade: '',
    endereco: { logradouro: '', bairro: '', cep: '', cidade: '', uf: '', numero: '', complemento: '' },
  }
}

// As mensagens são as mesmas do servidor (anotações dos DTOs Java), para a pessoa ver o mesmo texto
// venha o erro do navegador ou da API
const OBRIGATORIO = 'é obrigatório'
const EM_BRANCO = 'não pode ficar em branco'

const vazio = (valor: string) => valor.trim() === ''

/**
 * No cadastro, tudo menos número e complemento é obrigatório.
 * Na edição, e-mail, CRM e especialidade estão bloqueados; os demais não podem ficar em branco.
 * Devolve um objeto campo → mensagem, com as chaves no mesmo formato do servidor (ex.: "endereco.cep").
 */
export function validarMedico(dados: DadosFormulario, modo: 'cadastro' | 'edicao'): ErrosDoFormulario {
  const erros: ErrosDoFormulario = {}
  const mensagemDeVazio = modo === 'cadastro' ? OBRIGATORIO : EM_BRANCO

  const textos: [string, string][] = [
    ['nome', dados.nome],
    ['telefone', dados.telefone],
    ['endereco.logradouro', dados.endereco.logradouro],
    ['endereco.bairro', dados.endereco.bairro],
    ['endereco.cidade', dados.endereco.cidade],
  ]
  for (const [campo, valor] of textos) {
    if (vazio(valor)) erros[campo] = mensagemDeVazio
  }

  if (vazio(dados.endereco.cep)) erros['endereco.cep'] = mensagemDeVazio
  else if (!/^\d{8}$/.test(dados.endereco.cep)) erros['endereco.cep'] = 'deve ter 8 dígitos, sem traço'

  if (vazio(dados.endereco.uf)) erros['endereco.uf'] = mensagemDeVazio
  else if (!UFS.includes(dados.endereco.uf)) erros['endereco.uf'] = 'escolha uma UF da lista'

  if (modo === 'cadastro') {
    if (vazio(dados.email)) erros.email = OBRIGATORIO
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.email = 'deve ser um e-mail válido'

    if (vazio(dados.crm)) erros.crm = OBRIGATORIO
    else if (!/^\d{4,6}$/.test(dados.crm)) erros.crm = 'deve ter de 4 a 6 dígitos'

    if (dados.especialidade === '') erros.especialidade = OBRIGATORIO
  }

  return erros
}
