import { useId, type ReactNode } from 'react'

export interface PropsDoControle {
  id: string
  'aria-invalid': boolean
  'aria-describedby'?: string
}

interface Props {
  rotulo: string
  erro?: string
  dica?: string
  opcional?: boolean
  className?: string
  /** Recebe as props de acessibilidade e devolve o input ou select. */
  children(props: PropsDoControle): ReactNode
}

export default function Campo({ rotulo, erro, dica, opcional, className = '', children }: Props) {
  const id = useId()
  const idDica = `${id}-dica`
  const idErro = `${id}-erro`
  const descricoes = [erro && idErro, dica && idDica].filter(Boolean).join(' ')

  return (
    <div className={`campo ${className}`}>
      <label htmlFor={id} className="campo__rotulo">
        {rotulo} {opcional && <span className="campo__opcional">(opcional)</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': descricoes || undefined })}
      {erro && (
        <span id={idErro} className="campo__erro">
          {erro}
        </span>
      )}
      {dica && (
        <span id={idDica} className="campo__dica">
          {dica}
        </span>
      )}
    </div>
  )
}
