import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MEDICOS } from '../dominio/recursos'
import { ana, bruno } from '../test/fetchFalso'
import Tabela from './Tabela'

const colunas = MEDICOS.colunas

describe('Tabela (com as colunas de médico)', () => {
  it('deveRenderizarUmaLinhaPorItem', () => {
    render(<Tabela itens={[ana, bruno]} colunas={colunas} sort="nome,asc" onOrdenar={() => {}} />)
    const linhas = screen.getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(2)
    expect(within(linhas[0]).getByText('Ana Souza')).toBeInTheDocument()
    expect(within(linhas[0]).getByText('CRM 123456')).toBeInTheDocument()
    expect(within(linhas[0]).getByText('Cardiologia')).toBeInTheDocument()
  })

  it('deveMarcarAriaSortNaColunaOrdenada', () => {
    render(<Tabela itens={[ana]} colunas={colunas} sort="crm,desc" onOrdenar={() => {}} />)
    expect(screen.getByRole('columnheader', { name: /CRM/ })).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getByRole('columnheader', { name: /Nome/ })).not.toHaveAttribute('aria-sort')
  })

  it('deveInverterDirecaoQuandoClicarNaColunaJaOrdenada', async () => {
    const onOrdenar = vi.fn()
    render(<Tabela itens={[ana]} colunas={colunas} sort="nome,asc" onOrdenar={onOrdenar} />)

    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    expect(onOrdenar).toHaveBeenLastCalledWith('nome,desc')

    await userEvent.click(screen.getByRole('button', { name: /E-mail/ }))
    expect(onOrdenar).toHaveBeenLastCalledWith('email,asc')
  })

  it('deveReservarAlturaDoMinimoDeLinhasSemAlongarATabelaReal', () => {
    const { container } = render(
      <Tabela itens={[ana, bruno]} colunas={colunas} sort="nome,asc" onOrdenar={() => {}} linhasMinimas={5} />,
    )
    // A tabela real termina na última linha de verdade
    const real = container.querySelector('table:not([aria-hidden])')!
    expect(real.querySelectorAll('tbody tr')).toHaveLength(2)
    // Uma cópia invisível com o mínimo de linhas reserva a altura, fora do alcance de leitores de tela
    const reserva = container.querySelector('table[aria-hidden="true"]')!
    expect(reserva.querySelectorAll('tbody tr')).toHaveLength(5)
    expect(reserva.querySelector('tbody tr')!.children).toHaveLength(colunas.length)
    expect(screen.getAllByRole('table')).toHaveLength(1)
    expect(screen.getAllByRole('row').slice(1)).toHaveLength(2)
  })

  it('naoDeveReservarAlturaQuandoNaoHouverMinimo', () => {
    const { container } = render(<Tabela itens={[ana]} colunas={colunas} sort="nome,asc" onOrdenar={() => {}} />)
    expect(container.querySelectorAll('table')).toHaveLength(1)
  })

  it('deveRenderizarAcoesRecebidasPorLinha', () => {
    render(
      <Tabela
        itens={[ana, bruno]}
        colunas={colunas}
        sort="nome,asc"
        onOrdenar={() => {}}
        acoes={(m) => <button type="button">Editar {m.nome}</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Editar Bruno Lima' })).toBeInTheDocument()
  })
})
