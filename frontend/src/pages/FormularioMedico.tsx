import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ErroApi } from '../api/cliente'
import { cadastrarMedico } from '../api/medicos'
import type { Especialidade, MedicoCadastro } from '../api/tipos'
import Campo, { type PropsDoControle } from '../components/Campo'
import { ESPECIALIDADES, UFS } from '../dominio/constantes'
import { formularioVazio, validarMedico, type DadosFormulario, type ErrosDoFormulario } from '../dominio/validacao'

interface Props {
  modo: 'cadastro' | 'edicao'
}

export default function FormularioMedico({ modo }: Props) {
  const navigate = useNavigate()
  const formulario = useRef<HTMLFormElement>(null)
  const enviandoAgora = useRef(false)

  const [dados, setDados] = useState<DadosFormulario>(formularioVazio)
  const [erros, setErros] = useState<ErrosDoFormulario>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

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
      await cadastrarMedico(paraCadastro(dados))
      navigate('/', { state: { aviso: 'Médico cadastrado' } })
    } catch (erro) {
      mostrarErroDaApi(erro)
    } finally {
      enviandoAgora.current = false
      setEnviando(false)
    }
  }

  function texto(campo: string, extras: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) {
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

  return (
    <>
      <Link to="/" className="voltar">
        Voltar para a lista
      </Link>
      <div className="pagina__topo">
        <h1 className="pagina__titulo">Novo médico</h1>
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
            <Campo rotulo="E-mail" erro={erros.email} className="campo--metade">
              {texto('email', { type: 'email', autoComplete: 'email' })}
            </Campo>
            <Campo rotulo="Telefone" erro={erros.telefone} dica="Com DDD, só números" className="campo--metade">
              {texto('telefone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel' })}
            </Campo>
            <Campo rotulo="CRM" erro={erros.crm} dica="De 4 a 6 dígitos" className="campo--terco">
              {texto('crm', { inputMode: 'numeric', maxLength: 6 })}
            </Campo>
            <Campo rotulo="Especialidade" erro={erros.especialidade} className="campo--dois-tercos">
              {(props) => (
                <select
                  {...props}
                  name="especialidade"
                  value={dados.especialidade}
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
              {texto('endereco.cep', { inputMode: 'numeric', maxLength: 8, autoComplete: 'postal-code' })}
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
            {enviando ? 'Salvando…' : 'Cadastrar médico'}
          </button>
          <Link to="/" className="botao botao--secundario">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  )
}

function paraCadastro(dados: DadosFormulario): MedicoCadastro {
  const opcional = (valor: string) => (valor.trim() === '' ? null : valor)
  return {
    ...dados,
    especialidade: dados.especialidade as Especialidade,
    endereco: { ...dados.endereco, numero: opcional(dados.endereco.numero), complemento: opcional(dados.endereco.complemento) },
  }
}
