import type { ErroCampo, TipoErroApi } from './tipos'

export class ErroApi extends Error {
  readonly tipo: TipoErroApi
  readonly campos: ErroCampo[]

  constructor(tipo: TipoErroApi, mensagem: string, campos: ErroCampo[] = []) {
    super(mensagem)
    this.name = 'ErroApi'
    this.tipo = tipo
    this.campos = campos
  }
}

const MENSAGEM_REDE = 'Não foi possível falar com o servidor. Tente novamente.'
const MENSAGEM_SESSAO = 'Sua sessão expirou. Recarregue a página.'

export async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const cabecalhos: Record<string, string> = { Accept: 'application/json' }
  if (opcoes.body !== undefined) cabecalhos['Content-Type'] = 'application/json'

  let resposta: Response
  try {
    resposta = await fetch(caminho, { ...opcoes, headers: cabecalhos })
  } catch {
    throw new ErroApi('rede', MENSAGEM_REDE)
  }

  // O SSO do portal responde com redirecionamento para a página de login (HTML), não com JSON
  const tipoConteudo = resposta.headers.get('Content-Type') ?? ''
  if (resposta.redirected || tipoConteudo.includes('text/html')) {
    throw new ErroApi('sessao', MENSAGEM_SESSAO)
  }

  const texto = await resposta.text()
  const corpo: unknown = texto ? JSON.parse(texto) : undefined

  if (resposta.ok) return corpo as T
  throw criarErro(resposta.status, corpo)
}

function criarErro(status: number, corpo: unknown): ErroApi {
  const campos = Array.isArray(corpo) ? (corpo as ErroCampo[]) : []
  const mensagemDoCorpo = (corpo as { mensagem?: string } | undefined)?.mensagem

  switch (status) {
    case 400:
      return campos.length > 0
        ? new ErroApi('validacao', 'Revise os campos destacados.', campos)
        : new ErroApi('requisicao', mensagemDoCorpo ?? 'Requisição inválida.')
    case 404:
      return new ErroApi('nao-encontrado', 'Médico não encontrado.')
    case 409:
      return new ErroApi('conflito', campos[0]?.mensagem ?? 'Os dados já estão em uso.', campos)
    default:
      return new ErroApi('servidor', 'O servidor encontrou um erro. Tente novamente em instantes.')
  }
}
