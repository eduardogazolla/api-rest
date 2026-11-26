import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { json, simularFetch, vazio } from '../test/fetchFalso'
import FormularioCliente from './FormularioCliente'

function ListaFalsa() {
  const local = useLocation()
  return <p>Lista: {(local.state as { aviso?: string } | null)?.aviso}</p>
}

function renderizarCadastro() {
  return render(
    <MemoryRouter initialEntries={['/app/clientes/cadastro']}>
      <Routes>
        <Route path="/app/clientes" element={<ListaFalsa />} />
        <Route path="/app/clientes/cadastro" element={<FormularioCliente modo="cadastro" />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function preencherCadastroValido({ cpf = '529.982.247-25', nascimento = '1990-05-20' } = {}) {
  const usuario = userEvent.setup()
  await usuario.type(screen.getByLabelText('Nome'), 'Beatriz Rocha')
  await usuario.type(screen.getByLabelText('E-mail'), 'beatriz@exemplo.com')
  await usuario.type(screen.getByLabelText('Telefone'), '44999998888')
  await usuario.click(screen.getByLabelText('CPF'))
  await usuario.paste(cpf)
  // O seletor de data nativo não aceita digitação no jsdom; o change é o que o navegador dispara
  fireEvent.change(screen.getByLabelText('Data de nascimento'), { target: { value: nascimento } })
  await usuario.type(screen.getByLabelText('Logradouro'), 'Av. Brasil')
  await usuario.type(screen.getByLabelText('Bairro'), 'Centro')
  await usuario.type(screen.getByLabelText('CEP'), '87013000')
  await usuario.type(screen.getByLabelText('Cidade'), 'Maringá')
  await usuario.selectOptions(screen.getByLabelText('UF'), 'PR')
  return usuario
}

describe('FormularioCliente (cadastro)', () => {
  it('deveMostrarCpfComMascaraQuandoColar', async () => {
    simularFetch(() => vazio())
    renderizarCadastro()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByLabelText('CPF'))
    await usuario.paste('52998224725')

    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25')
  })

  it('naoDeveEnviarQuandoCpfForInvalido', async () => {
    const fetchFalso = simularFetch(() => vazio())
    renderizarCadastro()
    const usuario = await preencherCadastroValido({ cpf: '529.982.247-24' })

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar cliente' }))

    expect(screen.getByLabelText('CPF')).toHaveAccessibleDescription('CPF inválido')
    expect(screen.getByLabelText('CPF')).toHaveFocus()
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('deveRecusarDataFutura', async () => {
    const fetchFalso = simularFetch(() => vazio())
    renderizarCadastro()
    const usuario = await preencherCadastroValido({ nascimento: '2999-01-01' })

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar cliente' }))

    expect(screen.getByLabelText('Data de nascimento')).toHaveAccessibleDescription('deve ser uma data no passado')
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('deveMostrarErroDoServidorNoCampoCpfQuandoReceber409', async () => {
    simularFetch(() => json([{ campo: 'cpf', mensagem: 'Já existe um cliente com este CPF (ele pode estar inativo).' }], 409))
    renderizarCadastro()
    const usuario = await preencherCadastroValido()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar cliente' }))

    expect(await screen.findByText('Já existe um cliente com este CPF (ele pode estar inativo).')).toBeInTheDocument()
    expect(screen.getByLabelText('CPF')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nome')).toHaveValue('Beatriz Rocha')
  })

  it('deveEnviarSoDigitosDoCpfENavegarComAviso', async () => {
    const fetchFalso = simularFetch(() => vazio())
    renderizarCadastro()
    const usuario = await preencherCadastroValido()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar cliente' }))

    expect(await screen.findByText('Lista: Cliente cadastrado')).toBeInTheDocument()
    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('/clientes')
    expect(JSON.parse(String(init.body))).toMatchObject({
      cpf: '52998224725', dataNascimento: '1990-05-20', endereco: { cep: '87013000', uf: 'PR', numero: null },
    })
  })

  it('deveDesabilitarSalvarDuranteEnvio', async () => {
    const fetchFalso = simularFetch(() => new Promise<Response>(() => {}))
    renderizarCadastro()
    const usuario = await preencherCadastroValido()
    const botao = screen.getByRole('button', { name: 'Cadastrar cliente' })

    await usuario.click(botao)
    await usuario.click(botao)

    expect(botao).toBeDisabled()
    expect(fetchFalso).toHaveBeenCalledTimes(1)
  })
})

const detalhe = {
  id: 11, nome: 'Beatriz Rocha', email: 'beatriz@exemplo.com', telefone: '44999998888', cpf: '52998224725',
  dataNascimento: '1990-05-20', ativo: true,
  endereco: { logradouro: 'Av. Brasil', bairro: 'Centro', cep: '87013000', cidade: 'Maringá', uf: 'PR', numero: '100', complemento: null },
}

function renderizarEdicao(id: number | string = 11) {
  return render(
    <MemoryRouter initialEntries={[`/app/clientes/editar/${id}`]}>
      <Routes>
        <Route path="/app/clientes" element={<ListaFalsa />} />
        <Route path="/app/clientes/editar/:id" element={<FormularioCliente modo="edicao" />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FormularioCliente (edição)', () => {
  it('devePreencherComCpfFormatadoEDataDeNascimento', async () => {
    simularFetch(() => json(detalhe))
    renderizarEdicao()

    expect(await screen.findByRole('heading', { name: 'Editar cliente' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Beatriz Rocha')
    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25')
    expect(screen.getByLabelText('Data de nascimento')).toHaveValue('1990-05-20')
    expect(screen.getByLabelText(/Número/)).toHaveValue('100')
  })

  it('deveBloquearEmailCpfENascimentoComExplicacao', async () => {
    simularFetch(() => json(detalhe))
    renderizarEdicao()
    await screen.findByDisplayValue('Beatriz Rocha')

    for (const rotulo of ['E-mail', 'CPF', 'Data de nascimento']) {
      expect(screen.getByLabelText(rotulo)).toHaveAttribute('readonly')
      expect(screen.getByLabelText(rotulo)).toHaveAccessibleDescription('Não pode ser alterado')
    }
  })

  it('deveEnviarSoOQueMudouQuandoSalvar', async () => {
    const fetchFalso = simularFetch((_url, init) => (init.method === 'PUT' ? vazio() : json(detalhe)))
    renderizarEdicao()
    const usuario = userEvent.setup()
    const telefone = await screen.findByDisplayValue('44999998888')

    await usuario.clear(telefone)
    await usuario.type(telefone, '44911112222')
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('Lista: Cliente atualizado')).toBeInTheDocument()
    const put = fetchFalso.mock.calls.find(([, init]) => init.method === 'PUT')!
    expect(put[0]).toBe('/clientes')
    expect(JSON.parse(String(put[1].body))).toEqual({ id: 11, telefone: '44911112222' })
  })

  it('deveMostrarClienteNaoEncontradoQuando404', async () => {
    simularFetch(() => vazio(404))
    renderizarEdicao(99999)

    expect(await screen.findByRole('heading', { name: 'Cliente não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver clientes ativos' })).toHaveAttribute('href', '/app/clientes')
  })

  it('deveMostrarNaoEncontradoSemChamarApiQuandoIdNaoForNumero', async () => {
    const fetchFalso = simularFetch(() => json(detalhe))
    renderizarEdicao('abc')

    expect(await screen.findByRole('heading', { name: 'Cliente não encontrado' })).toBeInTheDocument()
    expect(fetchFalso).not.toHaveBeenCalled()
  })
})
