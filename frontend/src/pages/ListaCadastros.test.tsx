import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ErroApi } from '../api/cliente'
import { ana, bruno, json, pagina, simularFetch, vazio } from '../test/fetchFalso'
import { MEDICOS } from '../dominio/recursos'
import ListaCadastros from './ListaCadastros'

function UrlAtual() {
  const local = useLocation()
  return <span data-testid="url">{local.pathname + local.search}</span>
}

function renderizar(url = '/app/medicos', modo: 'ativos' | 'inativos' = 'ativos', state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: url.split('?')[0], search: url.includes('?') ? `?${url.split('?')[1]}` : '', state }]}>
      <Routes>
        <Route path="*" element={<><ListaCadastros area={MEDICOS} modo={modo} /><UrlAtual /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ListaCadastros: médicos ativos', () => {
  it('deveListarMedicosOrdenadosPorNomeQuandoAbrirSemParametros', async () => {
    const fetchFalso = simularFetch(() => json(pagina([ana, bruno])))
    renderizar()

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Médicos ativos' })).toBeInTheDocument()
    expect(screen.getByText('2 médicos')).toBeInTheDocument()
    expect(fetchFalso.mock.calls[0][0]).toBe('/medicos?page=0&size=10&sort=nome%2Casc')
  })

  it('deveAtualizarUrlQuandoOrdenarPorCrm', async () => {
    const fetchFalso = simularFetch(() => json(pagina([ana])))
    renderizar()
    await screen.findByText('Ana Souza')

    await userEvent.click(screen.getByRole('button', { name: /CRM/ }))

    expect(screen.getByTestId('url')).toHaveTextContent('/app/medicos?sort=crm%2Casc')
    await screen.findByText('Ana Souza')
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toBe('/medicos?page=0&size=10&sort=crm%2Casc')
  })

  it('deveMostrarEstadoVazioComAtalhoParaCadastroQuandoNaoHouverMedicos', async () => {
    simularFetch(() => json({ content: [], number: 0, totalPages: 0, totalElements: 0, size: 10 }))
    renderizar()

    expect(await screen.findByText('Nenhum médico ativo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cadastrar o primeiro médico' })).toHaveAttribute('href', '/app/medicos/cadastro')
  })

  it('deveMostrarLinkParaPrimeiraPaginaQuandoPaginaPassarDoFim', async () => {
    simularFetch(() => json({ content: [], number: 99, totalPages: 2, totalElements: 15, size: 10 }))
    renderizar('/app/medicos?page=99')

    expect(await screen.findByText('Esta página não existe')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Ir para a primeira página' }))
    expect(screen.getByTestId('url')).toHaveTextContent(/^\/app\/medicos$/)
  })

  it('deveMostrarMensagemDaApiEVoltarAoPadraoQuandoSortForInvalido', async () => {
    simularFetch((url) =>
      url.includes('xyz')
        ? json({ mensagem: 'Parâmetro sort inválido. Use uma propriedade do médico, por exemplo: nome ou crm,desc' }, 400)
        : json(pagina([ana])),
    )
    renderizar('/app/medicos?sort=xyz')

    expect(await screen.findByText(/Parâmetro sort inválido/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Voltar à ordenação padrão' }))
    expect(await screen.findByText('Ana Souza')).toBeInTheDocument()
  })

  it('deveMostrarErroDeConexaoQuandoRedeFalhar', async () => {
    simularFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    renderizar()

    expect(await screen.findByText('Não foi possível falar com o servidor. Tente novamente.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
  })

  it('deveTratarPaginaInvalidaNaUrlComoPrimeiraPagina', async () => {
    const fetchFalso = simularFetch(() => json(pagina([ana], 0, 2)))
    renderizar('/app/medicos?page=abc')

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(fetchFalso.mock.calls[0][0]).toContain('page=0')
  })

  it('deveMostrarAvisoRecebidoNaNavegacao', async () => {
    simularFetch(() => json(pagina([ana])))
    renderizar('/app/medicos', 'ativos', { aviso: 'Médico cadastrado' })

    expect(await screen.findByRole('status')).toHaveTextContent('Médico cadastrado')
  })

  it('deveMostrarSessaoExpiradaQuandoErroForSessao', async () => {
    simularFetch(() => new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } }))
    renderizar()

    expect(await screen.findByText(new ErroApi('sessao', 'Sua sessão expirou. Recarregue a página.').message)).toBeInTheDocument()
  })
})

describe('ListaCadastros: exclusão e reativação de médicos', () => {
  it('deveExcluirSomenteAposConfirmacao', async () => {
    const fetchFalso = simularFetch(() => json(pagina([ana, bruno])))
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(await screen.findByRole('button', { name: 'Excluir Ana Souza' }))
    expect(screen.getByRole('dialog', { name: 'Excluir médico?' })).toHaveTextContent('Ana Souza')
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(fetchFalso.mock.calls.some(([, init]) => init.method === 'DELETE')).toBe(false)
  })

  it('deveRemoverDaListaEMostrarAvisoQuandoExcluir', async () => {
    let excluida = false
    const fetchFalso = simularFetch((_url, init) => {
      if (init.method === 'DELETE') {
        excluida = true
        return vazio()
      }
      return json(pagina(excluida ? [bruno] : [ana, bruno]))
    })
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(await screen.findByRole('button', { name: 'Excluir Ana Souza' }))
    await usuario.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Médico excluído')
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument()
    expect(fetchFalso.mock.calls.find(([, init]) => init.method === 'DELETE')?.[0]).toBe('/medicos/1')
  })

  it('deveIrParaPaginaAnteriorQuandoExcluirUltimoDaUltimaPagina', async () => {
    const fetchFalso = simularFetch((url, init) => {
      if (init.method === 'DELETE') return vazio()
      return url.includes('page=1') ? json(pagina([bruno], 1, 2)) : json(pagina([ana], 0, 1))
    })
    renderizar('/app/medicos?page=1')
    const usuario = userEvent.setup()

    await usuario.click(await screen.findByRole('button', { name: 'Excluir Bruno Lima' }))
    await usuario.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByTestId('url')).toHaveTextContent(/^\/app\/medicos$/)
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toContain('page=0')
  })

  it('deveListarInativosComBotaoReativar', async () => {
    const fetchFalso = simularFetch(() => json(pagina([bruno])))
    renderizar('/app/medicos/inativos', 'inativos')

    expect(await screen.findByRole('heading', { name: 'Médicos inativos' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Reativar Bruno Lima' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Novo médico' })).not.toBeInTheDocument()
    expect(fetchFalso.mock.calls[0][0]).toMatch(/^\/medicos\/inativos\?/)
  })

  it('deveRemoverDaListaQuandoReativar', async () => {
    let reativado = false
    const fetchFalso = simularFetch((_url, init) => {
      if (init.method === 'PATCH') {
        reativado = true
        return vazio()
      }
      return json(pagina(reativado ? [] : [bruno]))
    })
    renderizar('/app/medicos/inativos', 'inativos')

    await userEvent.click(await screen.findByRole('button', { name: 'Reativar Bruno Lima' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Médico reativado')
    expect(await screen.findByText('Nenhum médico inativo')).toBeInTheDocument()
    expect(fetchFalso.mock.calls.find(([, init]) => init.method === 'PATCH')?.[0]).toBe('/medicos/2/ativar')
  })
})

describe('ListaCadastros: mensagens da entidade', () => {
  it('deveMostrarMedicoNaoEncontradoQuandoAcaoDer404', async () => {
    simularFetch((_url, init) => (init.method === 'PATCH' ? vazio(404) : json(pagina([bruno]))))
    renderizar('/app/medicos/inativos', 'inativos')

    await userEvent.click(await screen.findByRole('button', { name: 'Reativar Bruno Lima' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Médico não encontrado.')
  })
})
