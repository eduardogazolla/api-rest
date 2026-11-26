import { Link, Route, Routes } from 'react-router'
import Cabecalho from './components/Cabecalho'
import FormularioMedico from './pages/FormularioMedico'
import ListaMedicos from './pages/ListaMedicos'

export default function App() {
  return (
    <>
      <Cabecalho />
      <main className="pagina">
        <Routes>
          <Route path="/" element={<ListaMedicos modo="ativos" />} />
          <Route path="/inativos" element={<p>Médicos inativos</p>} />
          <Route path="/cadastro" element={<FormularioMedico modo="cadastro" />} />
          <Route path="/editar/:id" element={<p>Edição</p>} />
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
      <Link to="/" className="botao botao--primario">
        Ver médicos ativos
      </Link>
    </div>
  )
}
