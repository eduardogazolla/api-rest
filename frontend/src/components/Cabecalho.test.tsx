import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Cabecalho from './Cabecalho'

function renderizar(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Cabecalho />
    </MemoryRouter>,
  )
}

describe('Cabecalho', () => {
  it('deveTerLinkParaDocumentacaoDaApi', () => {
    renderizar()
    expect(screen.getByRole('link', { name: 'Documentação da API' })).toHaveAttribute('href', '/swagger-ui/index.html')
  })

  it('deveMarcarNavegacaoAtual', () => {
    renderizar('/inativos')
    expect(screen.getByRole('link', { name: 'Inativos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Médicos ativos' })).not.toHaveAttribute('aria-current')
  })
})
