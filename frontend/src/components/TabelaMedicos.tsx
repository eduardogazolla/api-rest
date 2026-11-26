import type { ReactNode } from 'react'
import type { MedicoListagem } from '../api/tipos'
import { rotuloDaEspecialidade } from '../dominio/constantes'

interface Props {
  medicos: MedicoListagem[]
  sort: string
  onOrdenar(sort: string): void
  acoes?(medico: MedicoListagem): ReactNode
}

const COLUNAS = [
  { campo: 'nome', rotulo: 'Nome' },
  { campo: 'email', rotulo: 'E-mail' },
  { campo: 'crm', rotulo: 'CRM' },
  { campo: 'especialidade', rotulo: 'Especialidade' },
]

export default function TabelaMedicos({ medicos, sort, onOrdenar, acoes }: Props) {
  const [campoOrdenado, direcao = 'asc'] = sort.split(',')

  function ordenarPor(campo: string) {
    const novaDirecao = campo === campoOrdenado && direcao === 'asc' ? 'desc' : 'asc'
    onOrdenar(`${campo},${novaDirecao}`)
  }

  return (
    <table className="tabela-medicos">
      <thead>
        <tr>
          {COLUNAS.map(({ campo, rotulo }) => {
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
        {medicos.map((medico) => (
          <tr key={medico.id}>
            <td className="coluna-nome medico__nome">{medico.nome}</td>
            <td className="coluna-email medico__email">{medico.email}</td>
            <td>
              <span className="carimbo">CRM {medico.crm}</span>
            </td>
            <td>
              <span className="especialidade" data-especialidade={medico.especialidade}>
                {rotuloDaEspecialidade(medico.especialidade)}
              </span>
            </td>
            {acoes && (
              <td className="coluna-acoes">
                <div className="acoes">{acoes(medico)}</div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
