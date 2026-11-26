import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ana, bruno } from '../test/fetchFalso'
import TabelaMedicos from './TabelaMedicos'

describe('TabelaMedicos', () => {
  it('deveRenderizarUmaLinhaPorMedico', () => {
    render(<TabelaMedicos medicos={[ana, bruno]} sort="nome,asc" onOrdenar={() => {}} />)
    const linhas = screen.getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(2)
    expect(within(linhas[0]).getByText('Ana Souza')).toBeInTheDocument()
    expect(within(linhas[0]).getByText('CRM 123456')).toBeInTheDocument()
    expect(within(linhas[0]).getByText('Cardiologia')).toBeInTheDocument()
  })

  it('deveMarcarAriaSortNaColunaOrdenada', () => {
    render(<TabelaMedicos medicos={[ana]} sort="crm,desc" onOrdenar={() => {}} />)
    expect(screen.getByRole('columnheader', { name: /CRM/ })).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getByRole('columnheader', { name: /Nome/ })).not.toHaveAttribute('aria-sort')
  })

  it('deveInverterDirecaoQuandoClicarNaColunaJaOrdenada', async () => {
    const onOrdenar = vi.fn()
    render(<TabelaMedicos medicos={[ana]} sort="nome,asc" onOrdenar={onOrdenar} />)

    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    expect(onOrdenar).toHaveBeenLastCalledWith('nome,desc')

    await userEvent.click(screen.getByRole('button', { name: /E-mail/ }))
    expect(onOrdenar).toHaveBeenLastCalledWith('email,asc')
  })

  it('deveRenderizarAcoesRecebidasPorLinha', () => {
    render(
      <TabelaMedicos
        medicos={[ana, bruno]}
        sort="nome,asc"
        onOrdenar={() => {}}
        acoes={(m) => <button type="button">Editar {m.nome}</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Editar Bruno Lima' })).toBeInTheDocument()
  })
})
