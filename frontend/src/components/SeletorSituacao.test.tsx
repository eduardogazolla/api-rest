import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import SeletorSituacao from './SeletorSituacao'

function renderizar(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <SeletorSituacao base="/app/clientes" />
    </MemoryRouter>,
  )
}

describe('SeletorSituacao', () => {
  it('deveMarcarAtivosNaListaPrincipal', () => {
    renderizar('/app/clientes?page=1')
    expect(screen.getByRole('navigation', { name: 'Situação' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ativos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Inativos' })).not.toHaveAttribute('aria-current')
  })

  it('deveMarcarInativosNaRotaDeInativos', () => {
    renderizar('/app/clientes/inativos')
    expect(screen.getByRole('link', { name: 'Inativos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Ativos' })).not.toHaveAttribute('aria-current')
  })

  it('deveApontarParaAsRotasDaArea', () => {
    renderizar('/app/clientes')
    expect(screen.getByRole('link', { name: 'Ativos' })).toHaveAttribute('href', '/app/clientes')
    expect(screen.getByRole('link', { name: 'Inativos' })).toHaveAttribute('href', '/app/clientes/inativos')
  })
})
