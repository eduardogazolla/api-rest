import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Cabecalho from './Cabecalho'

function renderizar(url = '/app/medicos') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Cabecalho />
    </MemoryRouter>,
  )
}

describe('Cabecalho', () => {
  it('deveMostrarAreasMedicosEClientes', () => {
    renderizar()
    expect(screen.getByRole('link', { name: 'Médicos' })).toHaveAttribute('href', '/app/medicos')
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('href', '/app/clientes')
    expect(screen.queryByRole('link', { name: 'Inativos' })).not.toBeInTheDocument()
  })

  it('deveMarcarMedicosComoAtualTambemNoCadastro', () => {
    renderizar('/app/medicos/cadastro')
    expect(screen.getByRole('link', { name: 'Médicos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Clientes' })).not.toHaveAttribute('aria-current')
  })

  it('deveMarcarClientesQuandoEstiverNaAreaDeClientes', () => {
    renderizar('/app/clientes/inativos')
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Médicos' })).not.toHaveAttribute('aria-current')
  })

  it('deveTerLinkParaDocumentacaoDaApi', () => {
    renderizar()
    expect(screen.getByRole('link', { name: 'Documentação da API' })).toHaveAttribute('href', '/swagger-ui/index.html')
  })
})
