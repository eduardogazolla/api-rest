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

const detalhe = {
  id: 7, nome: 'Ana Souza', email: 'ana@voll.med', telefone: '44999990000', crm: '123456',
  especialidade: 'CARDIOLOGIA', ativo: true,
  endereco: { logradouro: 'Rua das Flores', bairro: 'Centro', cep: '87000000', cidade: 'Maringá', uf: 'PR', numero: '100', complemento: null },
}

function renderizarEdicao(id = 7) {
  return render(
    <MemoryRouter initialEntries={[`/editar/${id}`]}>
      <Routes>
        <Route path="/" element={<ListaFalsa />} />
        <Route path="/editar/:id" element={<FormularioMedico modo="edicao" />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FormularioMedico (edição)', () => {
  it('devePreencherFormularioComDadosAtuais', async () => {
    simularFetch(() => json(detalhe))
    renderizarEdicao()

    expect(await screen.findByDisplayValue('Ana Souza')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Editar médico' })).toBeInTheDocument()
    expect(screen.getByLabelText('Telefone')).toHaveValue('44999990000')
    expect(screen.getByLabelText('CEP')).toHaveValue('87000000')
    expect(screen.getByLabelText(/Número/)).toHaveValue('100')
    expect(screen.getByLabelText(/Complemento/)).toHaveValue('')
  })

  it('deveBloquearEmailCrmEEspecialidadeComExplicacao', async () => {
    simularFetch(() => json(detalhe))
    renderizarEdicao()
    await screen.findByDisplayValue('Ana Souza')

    expect(screen.getByLabelText('E-mail')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('CRM')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('Especialidade')).toBeDisabled()
    expect(screen.getByLabelText('CRM')).toHaveAccessibleDescription(/Não pode ser alterado/)
  })

  it('deveEnviarSoCamposAlteradosQuandoSalvar', async () => {
    const fetchFalso = simularFetch((_url, init) => (init.method === 'PUT' ? vazio() : json(detalhe)))
    renderizarEdicao()
    const usuario = userEvent.setup()
    const telefone = await screen.findByDisplayValue('44999990000')

    await usuario.clear(telefone)
    await usuario.type(telefone, '44911112222')
    await usuario.clear(screen.getByLabelText(/Número/))
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('Lista: Médico atualizado')).toBeInTheDocument()
    const put = fetchFalso.mock.calls.find(([, init]) => init.method === 'PUT')!
    expect(JSON.parse(String(put[1].body))).toEqual({ id: 7, telefone: '44911112222', endereco: { numero: '' } })
  })

  it('deveMostrarMedicoNaoEncontradoQuando404', async () => {
    simularFetch(() => vazio(404))
    renderizarEdicao(99999)

    expect(await screen.findByRole('heading', { name: 'Médico não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver médicos ativos' })).toHaveAttribute('href', '/')
  })

  it('deveRecusarNomeEmBrancoNaEdicao', async () => {
    const fetchFalso = simularFetch(() => json(detalhe))
    renderizarEdicao()
    const usuario = userEvent.setup()
    await usuario.clear(await screen.findByDisplayValue('Ana Souza'))

    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription('não pode ficar em branco')
    expect(fetchFalso).toHaveBeenCalledTimes(1)
  })
})

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

  it('deveGuardarSoDigitosQuandoDigitarCepOuCrmComPontuacao', async () => {
    simularFetch(() => vazio())
    renderizarCadastro()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByLabelText('CEP'))
    await usuario.paste('87020-000')
    await usuario.type(screen.getByLabelText('CRM'), '12.345')

    expect(screen.getByLabelText('CEP')).toHaveValue('87020000')
    expect(screen.getByLabelText('CRM')).toHaveValue('12345')
  })

  it('deveMostrarErroGeralQuandoConflitoNaoTiverCampo', async () => {
    simularFetch(() => json([{ campo: null, mensagem: 'Já existe um médico com estes dados.' }], 409))
    renderizarCadastro()
    const usuario = await preencherCadastroValido()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar médico' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe um médico com estes dados.')
  })
})
