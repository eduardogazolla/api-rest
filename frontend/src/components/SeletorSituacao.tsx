import { NavLink } from 'react-router'

/** Alterna entre a lista de ativos e a de inativos de uma área; o endereço muda, então o F5 mantém a escolha. */
export default function SeletorSituacao({ base }: { base: string }) {
  return (
    <nav className="seletor" aria-label="Situação">
      <NavLink to={base} end className="seletor__opcao">
        Ativos
      </NavLink>
      <NavLink to={`${base}/inativos`} className="seletor__opcao">
        Inativos
      </NavLink>
    </nav>
  )
}
