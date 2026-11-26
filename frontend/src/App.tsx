import { Link, Navigate, Route, Routes } from 'react-router'
import Cabecalho from './components/Cabecalho'
import { CLIENTES, MEDICOS } from './dominio/recursos'
import FormularioMedico from './pages/FormularioMedico'
import ListaCadastros from './pages/ListaCadastros'

// Regra das rotas: tudo que é tela fica sob /app; /medicos e /clientes são da API (constituição V)
export default function App() {
  return (
    <>
      <Cabecalho />
      <main className="pagina">
        <Routes>
          <Route path="/" element={<Navigate replace to="/app/medicos" />} />
          <Route path="/app" element={<Navigate replace to="/app/medicos" />} />
          <Route path="/app/medicos" element={<ListaCadastros key="medicos-ativos" area={MEDICOS} modo="ativos" />} />
          <Route
            path="/app/medicos/inativos"
            element={<ListaCadastros key="medicos-inativos" area={MEDICOS} modo="inativos" />}
          />
          <Route path="/app/medicos/cadastro" element={<FormularioMedico modo="cadastro" />} />
          <Route path="/app/medicos/editar/:id" element={<FormularioMedico modo="edicao" />} />
          <Route path="/app/clientes" element={<ListaCadastros key="clientes-ativos" area={CLIENTES} modo="ativos" />} />
          <Route
            path="/app/clientes/inativos"
            element={<ListaCadastros key="clientes-inativos" area={CLIENTES} modo="inativos" />}
          />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Routes>
      </main>
    </>
  )
}

function PaginaNaoEncontrada() {
  return (
    <div className="estado">
      <h1 className="estado__titulo">Página não encontrada</h1>
      <p className="estado__texto">O endereço digitado não existe no sistema.</p>
      <Link to="/app/medicos" className="botao botao--primario">
        Ver médicos ativos
      </Link>
    </div>
  )
}
