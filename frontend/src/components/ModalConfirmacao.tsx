import { useEffect, useId, useRef } from 'react'

interface Props {
  aberto: boolean
  titulo: string
  mensagem: string
  rotuloConfirmar: string
  ocupado?: boolean
  onConfirmar(): void
  onCancelar(): void
}

// <dialog> nativo com showModal(): o navegador já prende o foco, escurece o fundo e fecha com Esc
export default function ModalConfirmacao({ aberto, titulo, mensagem, rotuloConfirmar, ocupado, onConfirmar, onCancelar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const cancelar = useRef<HTMLButtonElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const elemento = dialogo.current
    if (!elemento) return
    if (aberto && !elemento.open) {
      elemento.showModal()
      // Foco inicial na opção segura: um Enter acidental não exclui ninguém
      cancelar.current?.focus()
    }
    if (!aberto && elemento.open) elemento.close()
  }, [aberto])

  return (
    <dialog
      ref={dialogo}
      className="modal"
      aria-labelledby={idTitulo}
      onCancel={(evento) => {
        evento.preventDefault()
        onCancelar()
      }}
    >
      <h2 id={idTitulo} className="modal__titulo">
        {titulo}
      </h2>
      <p className="modal__texto">{mensagem}</p>
      <div className="modal__acoes">
        <button ref={cancelar} type="button" className="botao botao--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className="botao botao--perigo" disabled={ocupado} onClick={onConfirmar}>
          {rotuloConfirmar}
        </button>
      </div>
    </dialog>
  )
}
