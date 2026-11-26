import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ErroApi } from '../api/cliente'
import type { Pagina } from '../api/tipos'
import Aviso from '../components/Aviso'
import ModalConfirmacao from '../components/ModalConfirmacao'
import Paginacao from '../components/Paginacao'
import SeletorSituacao from '../components/SeletorSituacao'
import Tabela from '../components/Tabela'
import { maiuscula, type AreaDeCadastro } from '../dominio/recursos'

interface Props<L extends { id: number; nome: string }> {
  area: AreaDeCadastro<L>
  modo: 'ativos' | 'inativos'
}

const SORT_PADRAO = 'nome,asc'

/** ?page=abc ou ?page=-1 viram a primeira página, como o Spring também faz. */
function paginaDaUrl(valor: string | null): number {
  const numero = Number(valor)
  return Number.isInteger(numero) && numero > 0 ? numero : 0
}

function comoErroApi(erro: unknown): ErroApi {
  return erro instanceof ErroApi ? erro : new ErroApi('servidor', String(erro))
}

/** Lista paginada de uma área (médicos ou clientes): o comportamento é um só, os textos e colunas vêm da área. */
export default function ListaCadastros<L extends { id: number; nome: string }>({ area, modo }: Props<L>) {
  const { pathname, search, state } = useLocation()
  const navigate = useNavigate()
  const [parametros, setParametros] = useSearchParams()
  const page = paginaDaUrl(parametros.get('page'))
  const sort = parametros.get('sort') ?? SORT_PADRAO
  const { singular, plural, api, base } = area

  const [pagina, setPagina] = useState<Pagina<L> | null>(null)
  const [erro, setErro] = useState<ErroApi | null>(null)
  const [tentativa, setTentativa] = useState(0)
  // O id faz cada aviso remontar o componente, reiniciando os 5 s mesmo com o mesmo texto
  const [aviso, setAviso] = useState<{ texto: string; id: number } | null>(() => {
    const texto = (state as { aviso?: string } | null)?.aviso
    return texto ? { texto, id: 0 } : null
  })
  const [paraExcluir, setParaExcluir] = useState<L | null>(null)
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
    const listar = modo === 'ativos' ? api.listarAtivos : api.listarInativos
    listar({ page, sort })
      .then((resultado) => ativo && setPagina(resultado))
      .catch((e: unknown) => ativo && setErro(comoErroApi(e)))
    return () => {
      ativo = false
    }
  }, [api, modo, page, sort, tentativa])

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
      setAviso({ texto: mensagem, id: Date.now() })
      const eraOUltimoDaPagina = pagina?.content.length === 1 && page > 0
      if (eraOUltimoDaPagina) irParaPagina(page - 1)
      else setTentativa((t) => t + 1)
    } catch (e) {
      const erroApi = comoErroApi(e)
      // O cliente HTTP é neutro ("Não encontrado."); aqui sabemos de qual entidade se trata
      setErroDaAcao(erroApi.tipo === 'nao-encontrado' ? `${maiuscula(singular)} não encontrado.` : erroApi.message)
    } finally {
      setOcupado(false)
      setParaExcluir(null)
    }
  }

  return (
    <>
      <div className="pagina__topo">
        <div>
          <h1 className="pagina__titulo">{maiuscula(plural)}</h1>
          <div className="pagina__situacao">
            <SeletorSituacao base={base} />
            {pagina && (
              <p className="pagina__resumo">
                {pagina.totalElements === 1 ? `1 ${singular}` : `${pagina.totalElements} ${plural}`}
              </p>
            )}
          </div>
        </div>
        {modo === 'ativos' && (
          <Link to={`${base}/cadastro`} className="botao botao--primario">
            Novo {singular}
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

      {!erro && !pagina && <p className="carregando">Carregando {plural}…</p>}

      {pagina && pagina.totalElements === 0 && (
        <div className="estado">
          <p className="estado__titulo">
            Nenhum {singular} {modo === 'ativos' ? 'ativo' : 'inativo'}
          </p>
          {modo === 'ativos' ? (
            <>
              <p className="estado__texto">Cadastre um {singular} para ele aparecer aqui.</p>
              <Link to={`${base}/cadastro`} className="botao botao--primario">
                Cadastrar o primeiro {singular}
              </Link>
            </>
          ) : (
            <p className="estado__texto">{maiuscula(plural)} excluídos aparecem aqui e podem ser reativados.</p>
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
          <Tabela
            itens={pagina.content}
            colunas={area.colunas}
            sort={sort}
            onOrdenar={ordenar}
            acoes={(item) =>
              modo === 'ativos' ? (
                <>
                  <Link to={`${base}/editar/${item.id}`} className="botao botao--texto" aria-label={`Editar ${item.nome}`}>
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="botao botao--texto botao--perigo"
                    aria-label={`Excluir ${item.nome}`}
                    onClick={() => setParaExcluir(item)}
                  >
                    Excluir
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="botao botao--texto"
                  aria-label={`Reativar ${item.nome}`}
                  disabled={ocupado}
                  onClick={() => executar(() => api.reativar(item.id), `${maiuscula(singular)} reativado`)}
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
        titulo={`Excluir ${singular}?`}
        mensagem={`${paraExcluir?.nome ?? ''} sai da lista de ativos. Dá para reativar depois, em Inativos.`}
        rotuloConfirmar="Excluir"
        ocupado={ocupado}
        onConfirmar={() => paraExcluir && executar(() => api.excluir(paraExcluir.id), `${maiuscula(singular)} excluído`)}
        onCancelar={() => setParaExcluir(null)}
      />

      {aviso && <Aviso key={aviso.id} mensagem={aviso.texto} onFechar={fecharAviso} />}
    </>
  )
}
