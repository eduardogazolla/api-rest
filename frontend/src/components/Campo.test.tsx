import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Campo from './Campo'

describe('Campo', () => {
  it('deveLigarErroAoInputPorAriaDescribedby', () => {
    render(
      <Campo rotulo="CRM" dica="De 4 a 6 dígitos" erro="deve ter de 4 a 6 dígitos">
        {(props) => <input name="crm" {...props} />}
      </Campo>,
    )
    const input = screen.getByLabelText('CRM')
    expect(input).toHaveAccessibleDescription(/deve ter de 4 a 6 dígitos/)
    expect(input).toHaveAccessibleDescription(/De 4 a 6 dígitos/)
  })

  it('deveMarcarAriaInvalidQuandoHouverErro', () => {
    const { rerender } = render(<Campo rotulo="Nome">{(props) => <input {...props} />}</Campo>)
    expect(screen.getByLabelText('Nome')).not.toHaveAttribute('aria-invalid', 'true')

    rerender(<Campo rotulo="Nome" erro="é obrigatório">{(props) => <input {...props} />}</Campo>)
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
  })

  it('deveIndicarCampoOpcionalNoRotulo', () => {
    render(<Campo rotulo="Número" opcional>{(props) => <input {...props} />}</Campo>)
    expect(screen.getByLabelText(/Número/)).toBeInTheDocument()
    expect(screen.getByText('(opcional)')).toBeInTheDocument()
  })
})
