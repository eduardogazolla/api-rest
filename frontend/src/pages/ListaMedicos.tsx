import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ErroApi } from '../api/cliente'
import { excluirMedico, listarAtivos, listarInativos, reativarMedico } from '../api/medicos'
import type { MedicoListagem, Pagina } from '../api/tipos'
import Aviso from '../components/Aviso'
import ModalConfirmacao from '../components/ModalConfirmacao'
import Paginacao from '../components/Paginacao'
import TabelaMedicos from '../components/TabelaMedicos'

interface Props {
  modo: 'ativos' | 'inativos'
}

const SORT_PADRAO = 'nome,asc'

function comoErroApi(erro: unknown): ErroApi {
  return erro instanceof ErroApi ? erro : new ErroApi('servidor', String(erro))
}

export default function ListaMedicos({ modo }: Props) {
  const { pathname, search, state } = useLocation()
  const navigate = useNavigate()
  const [parametros, setParametros] = useSearchParams()
  const page = Number(parametros.get('page') ?? 0)
  const sort = parametros.get('sort') ?? SORT_PADRAO

  const [pagina, setPagina] = useState<Pagina<MedicoListagem> | null>(null)
  const [erro, setErro] = useState<ErroApi | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const [aviso, setAviso] = useState<string | null>((state as { aviso?: string } | null)?.aviso ?? null)
  const [paraExcluir, setParaExcluir] = useState<MedicoListagem | null>(null)
  const [erroDaAcao, setErroDaAcao] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const fecharAviso = useCallback(() => setAviso(null), [])

  // O aviso chega uma vez pela navegação; limpamos o state para ele não reaparecer num F5
  useEffect(() => {
    if ((state as { aviso?: string } | null)?.aviso) navigate(pathname + search, { replace: true, state: null })
  }, [state, pathname, search, navigate])

  useEffect(() => {
    let ativo = true
    setPagina(null)
    setErro(null)
    const listar = modo === 'ativos' ? listarAtivos : listarInativos
    listar({ page, sort })
      .then((resultado) => ativo && setPagina(resultado))
      .catch((e: unknown) => ativo && setErro(comoErroApi(e)))
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

  /** Executa a ação e recarrega; se a página ficou vazia, volta uma página em vez de mostrar o vazio. */
  async function executar(acao: () => Promise<void>, mensagem: string) {
    setOcupado(true)
    setErroDaAcao(null)
    try {
      await acao()
      setAviso(mensagem)
      const eraOUltimoDaPagina = pagina?.content.length === 1 && page > 0
      if (eraOUltimoDaPagina) irParaPagina(page - 1)
      else setTentativa((t) => t + 1)
    } catch (e) {
      setErroDaAcao(comoErroApi(e).message)
    } finally {
      setOcupado(false)
      setParaExcluir(null)
    }
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

      {erroDaAcao && (
        <p className="erro-geral" role="alert">
          {erroDaAcao}
        </p>
      )}

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
          <p className="estado__titulo">{modo === 'ativos' ? 'Nenhum médico ativo' : 'Nenhum médico inativo'}</p>
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
          <TabelaMedicos
            medicos={pagina.content}
            sort={sort}
            onOrdenar={ordenar}
            acoes={(medico) =>
              modo === 'ativos' ? (
                <>
                  <Link to={`/editar/${medico.id}`} className="botao botao--texto" aria-label={`Editar ${medico.nome}`}>
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="botao botao--texto botao--perigo"
                    aria-label={`Excluir ${medico.nome}`}
                    onClick={() => setParaExcluir(medico)}
                  >
                    Excluir
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="botao botao--texto"
                  aria-label={`Reativar ${medico.nome}`}
                  disabled={ocupado}
                  onClick={() => executar(() => reativarMedico(medico.id), 'Médico reativado')}
                >
                  Reativar
                </button>
              )
            }
          />
          {pagina.totalPages > 1 && (
            <Paginacao pagina={page} totalPaginas={pagina.totalPages} onMudar={irParaPagina} />
          )}
        </>
      )}

      <ModalConfirmacao
        aberto={paraExcluir !== null}
        titulo="Excluir médico?"
        mensagem={`${paraExcluir?.nome ?? ''} sai da lista de ativos. Dá para reativar depois, em Inativos.`}
        rotuloConfirmar="Excluir"
        ocupado={ocupado}
        onConfirmar={() => paraExcluir && executar(() => excluirMedico(paraExcluir.id), 'Médico excluído')}
        onCancelar={() => setParaExcluir(null)}
      />

      {aviso && <Aviso mensagem={aviso} onFechar={fecharAviso} />}
    </>
  )
}
