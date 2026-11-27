import type { ReactNode } from 'react'

export interface Coluna<T> {
  /** Propriedade enviada no sort da API (ex.: "crm" vira sort=crm,asc). */
  campo: string
  rotulo: string
  celula(item: T): ReactNode
  /** Classes da célula; coluna-nome e coluna-email ocupam a linha inteira no cartão do celular. */
  className?: string
}

interface Props<T extends { id: number }> {
  itens: T[]
  colunas: Coluna<T>[]
  sort: string
  onOrdenar(sort: string): void
  acoes?(item: T): ReactNode
  /**
   * Reserva a altura deste número de linhas, para o que vem abaixo (a paginação) não mudar de lugar
   * na última página. A tabela em si termina na última linha de verdade.
   */
  linhasMinimas?: number
}

export default function Tabela<T extends { id: number }>({ itens, colunas, sort, onOrdenar, acoes, linhasMinimas = 0 }: Props<T>) {
  const [campoOrdenado, direcao = 'asc'] = sort.split(',')

  function ordenarPor(campo: string) {
    const novaDirecao = campo === campoOrdenado && direcao === 'asc' ? 'desc' : 'asc'
    onOrdenar(`${campo},${novaDirecao}`)
  }

  const tabela = (
    <table className="tabela">
      <thead>
        <tr>
          {colunas.map(({ campo, rotulo }) => {
            const ordenada = campo === campoOrdenado
            return (
              <th
                key={campo}
                scope="col"
                aria-sort={ordenada ? (direcao === 'desc' ? 'descending' : 'ascending') : undefined}
              >
                <button type="button" className="ordenar" onClick={() => ordenarPor(campo)}>
                  {rotulo}
                  <span className="ordenar__seta" aria-hidden="true">
                    {ordenada ? (direcao === 'desc' ? '↓' : '↑') : ''}
                  </span>
                </button>
              </th>
            )
          })}
          {acoes && (
            <th scope="col">
              <span className="visualmente-oculto">Ações</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {itens.map((item) => (
          <tr key={item.id}>
            {colunas.map((coluna) => (
              <td key={coluna.campo} className={coluna.className}>
                {coluna.celula(item)}
              </td>
            ))}
            {acoes && (
              <td className="coluna-acoes">
                <div className="acoes">{acoes(item)}</div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )

  if (itens.length >= linhasMinimas) return tabela

  // Uma cópia invisível com linhas vazias, no mesmo lugar da tabela: a moldura fica com a altura de uma
  // página cheia, mas o que aparece é a tabela de verdade, terminando normalmente
  return (
    <div className="tabela-moldura">
      {tabela}
      <table className="tabela tabela--reserva" aria-hidden="true">
        <thead>
          <tr>
            {colunas.map(({ campo, rotulo }) => (
              <th key={campo}>
                <span className="ordenar">{rotulo}</span>
              </th>
            ))}
            {acoes && <th />}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: linhasMinimas }, (_, i) => (
            // Mesmas células de uma linha real, com um "botão" nas ações para ter a mesma altura
            <tr key={i}>
              {colunas.map((coluna) => (
                <td key={coluna.campo}>&nbsp;</td>
              ))}
              {acoes && (
                <td className="coluna-acoes">
                  <div className="acoes">
                    <span className="botao botao--texto">&nbsp;</span>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
