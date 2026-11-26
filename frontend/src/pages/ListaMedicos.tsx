import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { ErroApi } from '../api/cliente'
import { listarAtivos } from '../api/medicos'
import type { MedicoListagem, Pagina } from '../api/tipos'
import Paginacao from '../components/Paginacao'
import TabelaMedicos from '../components/TabelaMedicos'

interface Props {
  modo: 'ativos' | 'inativos'
}

const SORT_PADRAO = 'nome,asc'

export default function ListaMedicos({ modo }: Props) {
  const { pathname } = useLocation()
  const [parametros, setParametros] = useSearchParams()
  const page = Number(parametros.get('page') ?? 0)
  const sort = parametros.get('sort') ?? SORT_PADRAO

  const [pagina, setPagina] = useState<Pagina<MedicoListagem> | null>(null)
  const [erro, setErro] = useState<ErroApi | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    setPagina(null)
    setErro(null)
    listarAtivos({ page, sort })
      .then((resultado) => ativo && setPagina(resultado))
      .catch((e: unknown) => ativo && setErro(e instanceof ErroApi ? e : new ErroApi('servidor', String(e))))
    return () => {
      ativo = false
    }
  }, [modo, page, sort, tentativa])

  function irParaPagina(novaPagina: number) {
    const novos = new URLSearchParams(parametros)
    if (novaPagina === 0) novos.delete('page')
    else novos.set('page', String(novaPagina))
    setParametros(novos)
  }

  function ordenar(novoSort: string) {
    setParametros({ sort: novoSort })
  }

  const titulo = modo === 'ativos' ? 'Médicos ativos' : 'Médicos inativos'

  return (
    <>
      <div className="pagina__topo">
        <div>
          <h1 className="pagina__titulo">{titulo}</h1>
          {pagina && (
            <p className="pagina__resumo">
              {pagina.totalElements === 1 ? '1 médico' : `${pagina.totalElements} médicos`}
            </p>
          )}
        </div>
        {modo === 'ativos' && (
          <Link to="/cadastro" className="botao botao--primario">
            Novo médico
          </Link>
        )}
      </div>

      {erro && (
        <div className="estado estado--erro" role="alert">
          <p className="estado__titulo">{erro.message}</p>
          {erro.tipo === 'requisicao' ? (
            <p className="estado__texto">
              <Link to={pathname}>Voltar à ordenação padrão</Link>
            </p>
          ) : (
            erro.tipo !== 'sessao' && (
              <p className="estado__texto">
                <button type="button" className="botao botao--secundario" onClick={() => setTentativa((t) => t + 1)}>
                  Tentar de novo
                </button>
              </p>
            )
          )}
        </div>
      )}

      {!erro && !pagina && <p className="carregando">Carregando médicos…</p>}

      {pagina && pagina.totalElements === 0 && (
        <div className="estado">
          <p className="estado__titulo">
            {modo === 'ativos' ? 'Nenhum médico ativo' : 'Nenhum médico inativo'}
          </p>
          {modo === 'ativos' ? (
            <>
              <p className="estado__texto">Cadastre um médico para ele aparecer aqui.</p>
              <Link to="/cadastro" className="botao botao--primario">
                Cadastrar o primeiro médico
              </Link>
            </>
          ) : (
            <p className="estado__texto">Médicos excluídos aparecem aqui e podem ser reativados.</p>
          )}
        </div>
      )}

      {pagina && pagina.totalElements > 0 && pagina.content.length === 0 && (
        <div className="estado">
          <p className="estado__titulo">Esta página não existe</p>
          <p className="estado__texto">
            <Link to={pathname}>Ir para a primeira página</Link>
          </p>
        </div>
      )}

      {pagina && pagina.content.length > 0 && (
        <>
          <TabelaMedicos medicos={pagina.content} sort={sort} onOrdenar={ordenar} />
          {pagina.totalPages > 1 && (
            <Paginacao pagina={page} totalPaginas={pagina.totalPages} onMudar={irParaPagina} />
          )}
        </>
      )}
    </>
  )
}
