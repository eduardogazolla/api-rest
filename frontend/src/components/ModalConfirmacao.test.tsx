import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ModalConfirmacao from './ModalConfirmacao'

function renderizar(extras: { onConfirmar?: () => void; onCancelar?: () => void } = {}) {
  return render(
    <ModalConfirmacao
      aberto
      titulo="Excluir médico?"
      mensagem="Ana Souza sai da lista de ativos. Você pode reativá-la depois em Inativos."
      rotuloConfirmar="Excluir"
      onConfirmar={extras.onConfirmar ?? (() => {})}
      onCancelar={extras.onCancelar ?? (() => {})}
    />,
  )
}

describe('ModalConfirmacao', () => {
  it('deveMostrarMensagemComNomeDoMedico', () => {
    renderizar()
    const dialogo = screen.getByRole('dialog', { name: 'Excluir médico?' })
    expect(dialogo).toHaveTextContent('Ana Souza sai da lista de ativos.')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
  })

  it('deveChamarOnConfirmarQuandoConfirmar', async () => {
    const onConfirmar = vi.fn()
    renderizar({ onConfirmar })
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirmar).toHaveBeenCalledTimes(1)
  })

  it('deveChamarOnCancelarQuandoCancelarOuEsc', async () => {
    const onCancelar = vi.fn()
    renderizar({ onCancelar })

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    // O navegador dispara "cancel" no <dialog> quando a pessoa aperta Esc
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))

    expect(onCancelar).toHaveBeenCalledTimes(2)
  })
})
