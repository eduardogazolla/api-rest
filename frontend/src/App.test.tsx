import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ana, json, pagina, simularFetch } from './test/fetchFalso'

function renderizar(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App (rotas)', () => {
  it('deveRedirecionarRaizParaMedicos', async () => {
    const fetchFalso = simularFetch(() => json(pagina([ana])))
    renderizar('/')

    expect(await screen.findByRole('heading', { name: 'Médicos' })).toBeInTheDocument()
    expect(fetchFalso.mock.calls[0][0]).toMatch(/^\/medicos\?/)
  })

  it('deveMostrarPaginaNaoEncontradaEmRotaAntiga', () => {
    renderizar('/inativos')
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver médicos ativos' })).toHaveAttribute('href', '/app/medicos')
  })
})
