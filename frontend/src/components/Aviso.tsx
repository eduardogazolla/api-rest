import { useEffect } from 'react'

interface Props {
  mensagem: string
  onFechar(): void
}

const DURACAO_MS = 5000

export default function Aviso({ mensagem, onFechar }: Props) {
  useEffect(() => {
    const temporizador = setTimeout(onFechar, DURACAO_MS)
    return () => clearTimeout(temporizador)
  }, [mensagem, onFechar])

  return (
    <div className="aviso" role="status">
      {mensagem}
    </div>
  )
}
