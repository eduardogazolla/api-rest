// Espelho dos DTOs Java (med.voll.api.medico e med.voll.api.endereco)

export type Especialidade = 'ORTOPEDIA' | 'CARDIOLOGIA' | 'GINECOLOGIA' | 'DERMATOLOGIA'

export interface Endereco {
  logradouro: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  numero: string | null
  complemento: string | null
}

export interface MedicoListagem {
  id: number
  nome: string
  email: string
  crm: string
  especialidade: Especialidade
}

export interface MedicoDetalhe extends MedicoListagem {
  telefone: string
  endereco: Endereco
  ativo: boolean
}

export interface MedicoCadastro {
  nome: string
  email: string
  telefone: string
  crm: string
  especialidade: Especialidade
  endereco: Endereco
}

export interface CadastroAtualizacao {
  id: number
  nome?: string
  telefone?: string
  endereco?: Partial<Endereco>
}

export interface Pagina<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export interface ErroCampo {
  campo: string | null
  mensagem: string
}

export type TipoErroApi =
  | 'validacao'
  | 'conflito'
  | 'requisicao'
  | 'nao-encontrado'
  | 'rede'
  | 'sessao'
  | 'servidor'
