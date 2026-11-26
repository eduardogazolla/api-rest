interface Props {
  pagina: number
  totalPaginas: number
  onMudar(pagina: number): void
}

export default function Paginacao({ pagina, totalPaginas, onMudar }: Props) {
  return (
    <nav className="paginacao" aria-label="Paginação">
      <button
        type="button"
        className="botao botao--secundario"
        disabled={pagina === 0}
        onClick={() => onMudar(pagina - 1)}
      >
        Anterior
      </button>
      <span aria-live="polite">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <button
        type="button"
        className="botao botao--secundario"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onMudar(pagina + 1)}
      >
        Próxima
      </button>
    </nav>
  )
}
