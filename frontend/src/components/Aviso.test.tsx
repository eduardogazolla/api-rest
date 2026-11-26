import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Aviso from './Aviso'

describe('Aviso', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('deveFecharSozinhoDepoisDeCincoSegundos', () => {
    const onFechar = vi.fn()
    render(<Aviso mensagem="Médico excluído" onFechar={onFechar} />)

    expect(screen.getByRole('status')).toHaveTextContent('Médico excluído')
    act(() => vi.advanceTimersByTime(4999))
    expect(onFechar).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onFechar).toHaveBeenCalledTimes(1)
  })

  it('deveReiniciarOTempoQuandoOMesmoAvisoForRemontadoComOutraChave', () => {
    const onFechar = vi.fn()
    const { rerender } = render(<Aviso key={1} mensagem="Médico excluído" onFechar={onFechar} />)
    act(() => vi.advanceTimersByTime(4000))

    rerender(<Aviso key={2} mensagem="Médico excluído" onFechar={onFechar} />)
    act(() => vi.advanceTimersByTime(4000))

    expect(onFechar).not.toHaveBeenCalled()
  })
})
