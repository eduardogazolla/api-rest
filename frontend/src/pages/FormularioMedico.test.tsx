import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { json, simularFetch, vazio } from '../test/fetchFalso'
import FormularioMedico from './FormularioMedico'

function ListaFalsa() {
  const local = useLocation()
  return <p>Lista: {(local.state as { aviso?: string } | null)?.aviso}</p>
}

function renderizarCadastro() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/" element={<ListaFalsa />} />
        <Route path="/cadastro" element={<FormularioMedico modo="cadastro" />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function preencherCadastroValido(crm = '123456') {
  const usuario = userEvent.setup()
  await usuario.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await usuario.type(screen.getByLabelText('E-mail'), 'ana@voll.med')
  await usuario.type(screen.getByLabelText('Telefone'), '44999990000')
  await usuario.type(screen.getByLabelText('CRM'), crm)
  await usuario.selectOptions(screen.getByLabelText('Especialidade'), 'CARDIOLOGIA')
  await usuario.type(screen.getByLabelText('Logradouro'), 'Rua das Flores')
  await usuario.type(screen.getByLabelText('Bairro'), 'Centro')
  await usuario.type(screen.getByLabelText('CEP'), '87000000')
  await usuario.type(screen.getByLabelText('Cidade'), 'Maringá')
  await usuario.selectOptions(screen.getByLabelText('UF'), 'PR')
  return usuario
}

describe('FormularioMedico (cadastro)', () => {
  it('naoDeveEnviarQuandoValidacaoLocalFalhar', async () => {
    const fetchFalso = simularFetch(() => vazio())
    renderizarCadastro()
    const usuario = await preencherCadastroValido('12')

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar médico' }))

    expect(screen.getByLabelText('CRM')).toHaveAccessibleDescription(/deve ter de 4 a 6 dígitos/)
    expect(screen.getByLabelText('CRM')).toHaveFocus()
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('deveMostrarErroDoServidorNoCampoCrmEManterDadosQuandoReceber409', async () => {
    simularFetch(() => json([{ campo: 'crm', mensagem: 'Já existe um médico com este CRM (ele pode estar inativo).' }], 409))
    renderizarCadastro()
    const usuario = await preencherCadastroValido()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar médico' }))

    expect(await screen.findByText('Já existe um médico com este CRM (ele pode estar inativo).')).toBeInTheDocument()
    expect(screen.getByLabelText('CRM')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza')
  })

  it('deveNavegarParaListaComAvisoQuandoCadastrarComSucesso', async () => {
    const fetchFalso = simularFetch(() => vazio())
    renderizarCadastro()
    const usuario = await preencherCadastroValido()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar médico' }))

    expect(await screen.findByText('Lista: Médico cadastrado')).toBeInTheDocument()
    const [url, init] = fetchFalso.mock.calls[0]
    expect(url).toBe('/medicos')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toMatchObject({
      crm: '123456', especialidade: 'CARDIOLOGIA', endereco: { cep: '87000000', uf: 'PR', numero: null },
    })
  })

  it('deveDesabilitarSalvarDuranteEnvio', async () => {
    const fetchFalso = simularFetch(() => new Promise<Response>(() => {}))
    renderizarCadastro()
    const usuario = await preencherCadastroValido()
    const botao = screen.getByRole('button', { name: 'Cadastrar médico' })

    await usuario.click(botao)
    await usuario.click(botao)

    expect(botao).toBeDisabled()
    expect(fetchFalso).toHaveBeenCalledTimes(1)
  })

  it('deveMostrarErroGeralQuandoConflitoNaoTiverCampo', async () => {
    simularFetch(() => json([{ campo: null, mensagem: 'Já existe um médico com estes dados.' }], 409))
    renderizarCadastro()
    const usuario = await preencherCadastroValido()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar médico' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe um médico com estes dados.')
  })
})
