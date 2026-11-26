import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ErroApi } from '../api/cliente'
import { atualizarMedico, cadastrarMedico, calcularAlteracoes, detalharMedico } from '../api/medicos'
import type { Especialidade, MedicoCadastro, MedicoDetalhe } from '../api/tipos'
import Campo, { type PropsDoControle } from '../components/Campo'
import { ESPECIALIDADES, UFS } from '../dominio/constantes'
import { formularioVazio, validarMedico, type DadosFormulario, type ErrosDoFormulario } from '../dominio/validacao'

interface Props {
  modo: 'cadastro' | 'edicao'
}

const BLOQUEADO = 'Não pode ser alterado'

export default function FormularioMedico({ modo }: Props) {
  const navigate = useNavigate()
  const { id } = useParams()
  const edicao = modo === 'edicao'
  const formulario = useRef<HTMLFormElement>(null)
  const enviandoAgora = useRef(false)

  const [dados, setDados] = useState<DadosFormulario>(formularioVazio)
  const [original, setOriginal] = useState<MedicoDetalhe | null>(null)
  const [erroAoCarregar, setErroAoCarregar] = useState<ErroApi | null>(null)
  const [erros, setErros] = useState<ErrosDoFormulario>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!edicao) return
    let ativo = true
    detalharMedico(Number(id))
      .then((medico) => {
        if (!ativo) return
        setOriginal(medico)
        setDados(paraFormulario(medico))
      })
      .catch((e: unknown) => ativo && setErroAoCarregar(e instanceof ErroApi ? e : new ErroApi('servidor', String(e))))
    return () => {
      ativo = false
    }
  }, [edicao, id])

  function atualizar(campo: string, valor: string) {
    setDados((atual) =>
      campo.startsWith('endereco.')
        ? { ...atual, endereco: { ...atual.endereco, [campo.slice('endereco.'.length)]: valor } }
        : { ...atual, [campo]: valor },
    )
  }

  function valorDe(campo: string): string {
    return campo.startsWith('endereco.')
      ? dados.endereco[campo.slice('endereco.'.length) as keyof DadosFormulario['endereco']]
      : (dados[campo as keyof Omit<DadosFormulario, 'endereco'>] as string)
  }

  function focarPrimeiroErro(errosAtuais: ErrosDoFormulario) {
    const controles = formulario.current?.querySelectorAll<HTMLElement>('[name]') ?? []
    Array.from(controles).find((controle) => controle.getAttribute('name')! in errosAtuais)?.focus()
  }

  function mostrarErroDaApi(erro: unknown) {
    if (!(erro instanceof ErroApi)) {
      setErroGeral('Algo deu errado. Tente novamente.')
      return
    }
    if (erro.tipo === 'validacao' || erro.tipo === 'conflito') {
      const porCampo: ErrosDoFormulario = {}
      for (const { campo, mensagem } of erro.campos) {
        if (campo) porCampo[campo] = mensagem
        else setErroGeral(mensagem)
      }
      setErros(porCampo)
      focarPrimeiroErro(porCampo)
      return
    }
    setErroGeral(erro.message)
  }

  async function salvar() {
    if (edicao && original) {
      await atualizarMedico(calcularAlteracoes(original, dados))
      return 'Médico atualizado'
    }
    await cadastrarMedico(paraCadastro(dados))
    return 'Médico cadastrado'
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (enviandoAgora.current) return

    const errosLocais = validarMedico(dados, modo)
    setErros(errosLocais)
    setErroGeral(null)
    if (Object.keys(errosLocais).length > 0) {
      focarPrimeiroErro(errosLocais)
      return
    }

    enviandoAgora.current = true
    setEnviando(true)
    try {
      const aviso = await salvar()
      navigate('/', { state: { aviso } })
    } catch (erro) {
      mostrarErroDaApi(erro)
    } finally {
      enviandoAgora.current = false
      setEnviando(false)
    }
  }

  function texto(campo: string, extras: InputHTMLAttributes<HTMLInputElement> = {}) {
    return (props: PropsDoControle) => (
      <input
        {...props}
        {...extras}
        name={campo}
        value={valorDe(campo)}
        onChange={(e) => atualizar(campo, e.target.value)}
      />
    )
  }

  // Sem maxLength: ele cortaria "87020-000" colado para "87020-00" antes de tirarmos o traço
  function numerico(campo: string, limite: number, extras: InputHTMLAttributes<HTMLInputElement> = {}) {
    return (props: PropsDoControle) => (
      <input
        {...props}
        {...extras}
        name={campo}
        inputMode="numeric"
        value={valorDe(campo)}
        onChange={(e) => atualizar(campo, e.target.value.replace(/\D/g, '').slice(0, limite))}
      />
    )
  }

  if (erroAoCarregar?.tipo === 'nao-encontrado') {
    return (
      <div className="estado">
        <h1 className="estado__titulo">Médico não encontrado</h1>
        <p className="estado__texto">O médico pode ter sido removido ou o endereço está incorreto.</p>
        <Link to="/" className="botao botao--primario">
          Ver médicos ativos
        </Link>
      </div>
    )
  }
  if (erroAoCarregar) {
    return (
      <div className="estado estado--erro" role="alert">
        <p className="estado__titulo">{erroAoCarregar.message}</p>
      </div>
    )
  }
  if (edicao && !original) return <p className="carregando">Carregando médico…</p>

  return (
    <>
      <Link to="/" className="voltar">
        Voltar para a lista
      </Link>
      <div className="pagina__topo">
        <h1 className="pagina__titulo">{edicao ? 'Editar médico' : 'Novo médico'}</h1>
      </div>

      <form ref={formulario} className="formulario" noValidate onSubmit={enviar}>
        {erroGeral && (
          <p className="erro-geral" role="alert">
            {erroGeral}
          </p>
        )}

        <fieldset className="grupo">
          <legend>Dados do médico</legend>
          <div className="grade">
            <Campo rotulo="Nome" erro={erros.nome}>
              {texto('nome', { autoComplete: 'name' })}
            </Campo>
            <Campo rotulo="E-mail" erro={erros.email} dica={edicao ? BLOQUEADO : undefined} className="campo--metade">
              {texto('email', { type: 'email', autoComplete: 'email', readOnly: edicao })}
            </Campo>
            <Campo rotulo="Telefone" erro={erros.telefone} dica="Com DDD, só números" className="campo--metade">
              {texto('telefone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel' })}
            </Campo>
            <Campo rotulo="CRM" erro={erros.crm} dica={edicao ? BLOQUEADO : 'De 4 a 6 dígitos'} className="campo--terco">
              {numerico('crm', 6, { readOnly: edicao })}
            </Campo>
            <Campo
              rotulo="Especialidade"
              erro={erros.especialidade}
              dica={edicao ? BLOQUEADO : undefined}
              className="campo--dois-tercos"
            >
              {(props) => (
                <select
                  {...props}
                  name="especialidade"
                  value={dados.especialidade}
                  disabled={edicao}
                  onChange={(e) => atualizar('especialidade', e.target.value as Especialidade)}
                >
                  <option value="">Escolha a especialidade</option>
                  {ESPECIALIDADES.map(({ valor, rotulo }) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
          </div>
        </fieldset>

        <fieldset className="grupo">
          <legend>Endereço</legend>
          <div className="grade">
            <Campo rotulo="CEP" erro={erros['endereco.cep']} dica="8 dígitos, sem traço" className="campo--terco">
              {numerico('endereco.cep', 8, { autoComplete: 'postal-code' })}
            </Campo>
            <Campo rotulo="Logradouro" erro={erros['endereco.logradouro']} className="campo--dois-tercos">
              {texto('endereco.logradouro', { autoComplete: 'address-line1' })}
            </Campo>
            <Campo rotulo="Número" opcional erro={erros['endereco.numero']} className="campo--terco">
              {texto('endereco.numero')}
            </Campo>
            <Campo rotulo="Complemento" opcional erro={erros['endereco.complemento']} className="campo--dois-tercos">
              {texto('endereco.complemento', { autoComplete: 'address-line2' })}
            </Campo>
            <Campo rotulo="Bairro" erro={erros['endereco.bairro']} className="campo--metade">
              {texto('endereco.bairro')}
            </Campo>
            <Campo rotulo="Cidade" erro={erros['endereco.cidade']} className="campo--terco">
              {texto('endereco.cidade', { autoComplete: 'address-level2' })}
            </Campo>
            <Campo rotulo="UF" erro={erros['endereco.uf']} className="campo--sexto">
              {(props) => (
                <select
                  {...props}
                  name="endereco.uf"
                  value={dados.endereco.uf}
                  autoComplete="address-level1"
                  onChange={(e) => atualizar('endereco.uf', e.target.value)}
                >
                  <option value="">--</option>
                  {UFS.map((uf) => (
                    <option key={uf}>{uf}</option>
                  ))}
                </select>
              )}
            </Campo>
          </div>
        </fieldset>

        <div className="formulario__acoes">
          <button type="submit" className="botao botao--primario" disabled={enviando}>
            {enviando ? 'Salvando…' : edicao ? 'Salvar alterações' : 'Cadastrar médico'}
          </button>
          <Link to="/" className="botao botao--secundario">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  )
}

function paraFormulario(medico: MedicoDetalhe): DadosFormulario {
  return {
    nome: medico.nome,
    email: medico.email,
    telefone: medico.telefone,
    crm: medico.crm,
    especialidade: medico.especialidade,
    endereco: {
      ...medico.endereco,
      numero: medico.endereco.numero ?? '',
      complemento: medico.endereco.complemento ?? '',
    },
  }
}

function paraCadastro(dados: DadosFormulario): MedicoCadastro {
  const opcional = (valor: string) => (valor.trim() === '' ? null : valor)
  return {
    ...dados,
    especialidade: dados.especialidade as Especialidade,
    endereco: { ...dados.endereco, numero: opcional(dados.endereco.numero), complemento: opcional(dados.endereco.complemento) },
  }
}
