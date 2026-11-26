import { describe, expect, it, vi } from 'vitest'
import { ErroApi, requisitar } from './cliente'

function responder(status: number, corpo?: unknown, opcoes: { tipo?: string; redirecionada?: boolean } = {}) {
  const texto = corpo === undefined ? '' : typeof corpo === 'string' ? corpo : JSON.stringify(corpo)
  const resposta = new Response(texto === '' ? null : texto, {
    status,
    headers: texto === '' ? {} : { 'Content-Type': opcoes.tipo ?? 'application/json' },
  })
  if (opcoes.redirecionada) Object.defineProperty(resposta, 'redirected', { value: true })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resposta))
}

async function erroDe(promessa: Promise<unknown>): Promise<ErroApi> {
  try {
    await promessa
  } catch (erro) {
    if (erro instanceof ErroApi) return erro
    throw erro
  }
  throw new Error('era esperado um ErroApi')
}

describe('requisitar', () => {
  it('deveDevolverJsonQuandoRespostaForOk', async () => {
    responder(200, { id: 1 })
    await expect(requisitar('/medicos/1')).resolves.toEqual({ id: 1 })
    expect(fetch).toHaveBeenCalledWith('/medicos/1', expect.objectContaining({
      headers: expect.objectContaining({ Accept: 'application/json' }),
    }))
  })

  it('deveDevolverUndefinedQuandoRespostaOkVierSemCorpo', async () => {
    responder(200)
    await expect(requisitar('/medicos', { method: 'POST', body: '{}' })).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith('/medicos', expect.objectContaining({
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    }))
  })

  it('deveLancarValidacaoComCamposQuando400ForLista', async () => {
    responder(400, [{ campo: 'crm', mensagem: 'deve ter de 4 a 6 dígitos' }])
    const erro = await erroDe(requisitar('/medicos'))
    expect(erro.tipo).toBe('validacao')
    expect(erro.campos).toEqual([{ campo: 'crm', mensagem: 'deve ter de 4 a 6 dígitos' }])
  })

  it('deveLancarRequisicaoComMensagemQuando400ForObjeto', async () => {
    responder(400, { mensagem: 'Parâmetro sort inválido.' })
    const erro = await erroDe(requisitar('/medicos?sort=xyz'))
    expect(erro.tipo).toBe('requisicao')
    expect(erro.message).toBe('Parâmetro sort inválido.')
  })

  it('deveLancarConflitoQuando409', async () => {
    responder(409, [{ campo: 'crm', mensagem: 'Já existe um médico com este CRM (ele pode estar inativo).' }])
    const erro = await erroDe(requisitar('/medicos'))
    expect(erro.tipo).toBe('conflito')
    expect(erro.campos[0].campo).toBe('crm')
  })

  it('deveLancarNaoEncontradoQuando404', async () => {
    responder(404)
    expect((await erroDe(requisitar('/medicos/99'))).tipo).toBe('nao-encontrado')
  })

  it('deveLancarRedeQuandoFetchFalhar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const erro = await erroDe(requisitar('/medicos'))
    expect(erro.tipo).toBe('rede')
    expect(erro.message).toBe('Não foi possível falar com o servidor. Tente novamente.')
  })

  it('deveLancarSessaoQuandoRespostaForRedirecionadaOuHtml', async () => {
    responder(200, '<html>login</html>', { tipo: 'text/html' })
    expect((await erroDe(requisitar('/medicos'))).tipo).toBe('sessao')

    responder(200, { ok: true }, { redirecionada: true })
    const erro = await erroDe(requisitar('/medicos'))
    expect(erro.tipo).toBe('sessao')
    expect(erro.message).toBe('Sua sessão expirou. Recarregue a página.')
  })

  it('deveLancarSessaoQuandoSsoRedirecionarParaOutroDominio', async () => {
    // Com redirect: 'manual', um 302 para o login do SSO chega como resposta opaca, sem corpo
    const opaca = { type: 'opaqueredirect', status: 0, ok: false, redirected: false, headers: new Headers(), text: async () => '' }
    const fetchFalso = vi.fn().mockResolvedValue(opaca)
    vi.stubGlobal('fetch', fetchFalso)

    expect((await erroDe(requisitar('/medicos'))).tipo).toBe('sessao')
    expect(fetchFalso).toHaveBeenCalledWith('/medicos', expect.objectContaining({ redirect: 'manual' }))
  })

  it('deveLancarSessaoQuando401Ou403', async () => {
    responder(401)
    expect((await erroDe(requisitar('/medicos'))).tipo).toBe('sessao')
    responder(403)
    expect((await erroDe(requisitar('/medicos'))).tipo).toBe('sessao')
  })

  it('deveLancarServidorSemVazarErroDeParseQuandoCorpoNaoForJson', async () => {
    responder(502, 'Bad Gateway', { tipo: 'text/plain' })
    const erro = await erroDe(requisitar('/medicos'))
    expect(erro.tipo).toBe('servidor')
    expect(erro.message).toBe('O servidor encontrou um erro. Tente novamente em instantes.')
  })

  it('deveLancarServidorQuando500', async () => {
    responder(500)
    expect((await erroDe(requisitar('/medicos'))).tipo).toBe('servidor')
  })
})
