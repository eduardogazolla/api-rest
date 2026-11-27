import { Link, NavLink } from 'react-router'

export default function Cabecalho() {
  return (
    <header className="cabecalho">
      <div className="cabecalho__interno">
        <Link to="/app/medicos" className="marca">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#fff" />
          </svg>
          Voll.med
        </Link>
        <nav className="navegacao" aria-label="Principal">
          {/* Sem "end": a área fica marcada também no cadastro, na edição e nos inativos */}
          <NavLink to="/app/medicos">Médicos</NavLink>
          <NavLink to="/app/clientes">Clientes</NavLink>
        </nav>
        {/* <a> e não <Link>: o Swagger é servido pelo Spring, fora do React Router */}
        <a className="link-docs" href="/swagger-ui/index.html">
          Documentação da API
        </a>
      </div>
    </header>
  )
}
