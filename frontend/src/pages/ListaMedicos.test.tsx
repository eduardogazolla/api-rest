import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ErroApi } from '../api/cliente'
import { ana, bruno, json, pagina, simularFetch } from '../test/fetchFalso'
import ListaMedicos from './ListaMedicos'

function UrlAtual() {
  const local = useLocation()
  return <span data-testid="url">{local.pathname + local.search}</span>
}

function renderizar(url = '/', modo: 'ativos' | 'inativos' = 'ativos', state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: url.split('?')[0], search: url.includes('?') ? `?${url.split('?')[1]}` : '', state }]}>
      <Routes>
        <Route path="*" element={<><ListaMedicos modo={modo} /><UrlAtual /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ListaMedicos (ativos)', () => {
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

    expect(screen.getByTestId('url')).toHaveTextContent('/?sort=crm%2Casc')
    await screen.findByText('Ana Souza')
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toBe('/medicos?page=0&size=10&sort=crm%2Casc')
  })

  it('deveMostrarEstadoVazioComAtalhoParaCadastroQuandoNaoHouverMedicos', async () => {
    simularFetch(() => json({ content: [], number: 0, totalPages: 0, totalElements: 0, size: 10 }))
    renderizar()

    expect(await screen.findByText('Nenhum médico ativo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cadastrar o primeiro médico' })).toHaveAttribute('href', '/cadastro')
  })

  it('deveMostrarLinkParaPrimeiraPaginaQuandoPaginaPassarDoFim', async () => {
    simularFetch(() => json({ content: [], number: 99, totalPages: 2, totalElements: 15, size: 10 }))
    renderizar('/?page=99')

    expect(await screen.findByText('Esta página não existe')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Ir para a primeira página' }))
    expect(screen.getByTestId('url')).toHaveTextContent(/^\/$/)
  })

  it('deveMostrarMensagemDaApiEVoltarAoPadraoQuandoSortForInvalido', async () => {
    simularFetch((url) =>
      url.includes('xyz')
        ? json({ mensagem: 'Parâmetro sort inválido. Use uma propriedade do médico, por exemplo: nome ou crm,desc' }, 400)
        : json(pagina([ana])),
    )
    renderizar('/?sort=xyz')

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

  it('deveMostrarAvisoRecebidoNaNavegacao', async () => {
    simularFetch(() => json(pagina([ana])))
    renderizar('/', 'ativos', { aviso: 'Médico cadastrado' })

    expect(await screen.findByRole('status')).toHaveTextContent('Médico cadastrado')
  })

  it('deveMostrarSessaoExpiradaQuandoErroForSessao', async () => {
    simularFetch(() => new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } }))
    renderizar()

    expect(await screen.findByText(new ErroApi('sessao', 'Sua sessão expirou. Recarregue a página.').message)).toBeInTheDocument()
  })
})
