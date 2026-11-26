import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { maiuscula } from '../dominio/recursos'
import type { FormularioDeCadastro } from '../hooks/useFormularioCadastro'

interface Props {
  form: FormularioDeCadastro
  /** Os grupos de campos da entidade (fieldsets). */
  children: ReactNode
}

/**
 * A moldura comum dos formulários: estados de carregando e não encontrado, título, erro geral
 * e os botões. O formulário de cada entidade entra como children.
 */
export default function FormularioCadastro({ form, children }: Props) {
  const { base, singular, plural, edicao, erroAoCarregar, original, erroGeral, enviando, enviar, formulario } = form

  if (erroAoCarregar?.tipo === 'nao-encontrado') {
    return (
      <div className="estado">
        <h1 className="estado__titulo">{maiuscula(singular)} não encontrado</h1>
        <p className="estado__texto">O {singular} pode ter sido removido ou o endereço está incorreto.</p>
        <Link to={base} className="botao botao--primario">
          Ver {plural} ativos
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
  if (edicao && !original) return <p className="carregando">Carregando {singular}…</p>

  return (
    <>
      <Link to={base} className="voltar">
        Voltar para a lista
      </Link>
      <div className="pagina__topo">
        <h1 className="pagina__titulo">{edicao ? `Editar ${singular}` : `Novo ${singular}`}</h1>
      </div>

      <form ref={formulario} className="formulario" noValidate onSubmit={enviar}>
        {erroGeral && (
          <p className="erro-geral" role="alert">
            {erroGeral}
          </p>
        )}

        {children}

        <div className="formulario__acoes">
          <button type="submit" className="botao botao--primario" disabled={enviando}>
            {enviando ? 'Salvando…' : edicao ? 'Salvar alterações' : `Cadastrar ${singular}`}
          </button>
          <Link to={base} className="botao botao--secundario">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  )
}
