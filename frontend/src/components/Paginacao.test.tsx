import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Paginacao from './Paginacao'

describe('Paginacao', () => {
  it('deveDesabilitarAnteriorQuandoNaPrimeiraPagina', () => {
    render(<Paginacao pagina={0} totalPaginas={3} onMudar={() => {}} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeEnabled()
  })

  it('deveChamarOnMudarComProximaPaginaQuandoClicarProxima', async () => {
    const onMudar = vi.fn()
    render(<Paginacao pagina={0} totalPaginas={3} onMudar={onMudar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(onMudar).toHaveBeenCalledWith(1)
  })

  it('deveMostrarPaginaAtualDeTotal', () => {
    render(<Paginacao pagina={1} totalPaginas={3} onMudar={() => {}} />)
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()
  })
})
