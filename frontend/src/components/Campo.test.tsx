import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Campo from './Campo'

describe('Campo', () => {
  it('deveLigarErroAoInputPorAriaDescribedby', () => {
    render(
      <Campo rotulo="CRM" erro="deve ter de 4 a 6 dígitos">
        {(props) => <input name="crm" {...props} />}
      </Campo>,
    )
    expect(screen.getByLabelText('CRM')).toHaveAccessibleDescription('deve ter de 4 a 6 dígitos')
  })

  it('deveTrocarDicaPeloErroQuandoHouverErro', () => {
    const { rerender } = render(
      <Campo rotulo="CRM" dica="De 4 a 6 dígitos">{(props) => <input {...props} />}</Campo>,
    )
    expect(screen.getByLabelText('CRM')).toHaveAccessibleDescription('De 4 a 6 dígitos')

    rerender(
      <Campo rotulo="CRM" dica="De 4 a 6 dígitos" erro="deve ter de 4 a 6 dígitos">
        {(props) => <input {...props} />}
      </Campo>,
    )
    expect(screen.getByLabelText('CRM')).toHaveAccessibleDescription('deve ter de 4 a 6 dígitos')
    expect(screen.queryByText('De 4 a 6 dígitos')).not.toBeInTheDocument()
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
