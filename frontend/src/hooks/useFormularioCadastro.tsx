import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ErroApi } from '../api/cliente'
import type { PropsDoControle } from '../components/Campo'
import { maiuscula } from '../dominio/recursos'
import type { EnderecoFormulario, ErrosDoFormulario, ModoFormulario } from '../dominio/validacao'

/** Estado de formulário: campos de texto no primeiro nível e o endereço aninhado. */
export type DadosDeFormulario = { endereco: EnderecoFormulario } & object

export interface OpcoesDoFormulario<F extends DadosDeFormulario, D> {
  modo: ModoFormulario
  /** Rota de tela da área, para onde volta depois de salvar (ex.: /app/clientes). */
  base: string
  singular: string
  plural: string
  vazio(): F
  detalhar(id: number): Promise<D>
  paraFormulario(detalhe: D): F
  validar(dados: F, modo: ModoFormulario): ErrosDoFormulario
  cadastrar(dados: F): Promise<void>
  atualizar(original: D, dados: F): Promise<void>
}

/**
 * O comportamento comum aos formulários de médico e de cliente: carregar na edição, validar antes
 * de enviar, impedir envio duplo, mostrar erros do servidor no campo certo e voltar à lista com aviso.
 * Cada formulário só desenha os seus campos.
 */
export function useFormularioCadastro<F extends DadosDeFormulario, D>(opcoes: OpcoesDoFormulario<F, D>) {
  const { modo, base, singular, plural } = opcoes
  const navigate = useNavigate()
  const { id } = useParams()
  const edicao = modo === 'edicao'
  const formulario = useRef<HTMLFormElement>(null)
  const enviandoAgora = useRef(false)
  // As funções de opcoes mudam a cada render do formulário; o efeito de carga usa só as da primeira
  const opcoesIniciais = useRef(opcoes)

  const [dados, setDados] = useState<F>(opcoes.vazio)
  const [original, setOriginal] = useState<D | null>(null)
  const [erroAoCarregar, setErroAoCarregar] = useState<ErroApi | null>(null)
  const [erros, setErros] = useState<ErrosDoFormulario>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!edicao) return
    // /editar/abc nem chega à API: só ids numéricos existem
    if (!/^\d+$/.test(id ?? '')) {
      setErroAoCarregar(new ErroApi('nao-encontrado', `${maiuscula(singular)} não encontrado.`))
      return
    }
    let ativo = true
    const { detalhar, paraFormulario } = opcoesIniciais.current
    detalhar(Number(id))
      .then((detalhe) => {
        if (!ativo) return
        setOriginal(detalhe)
        setDados(paraFormulario(detalhe))
      })
      .catch((e: unknown) => ativo && setErroAoCarregar(e instanceof ErroApi ? e : new ErroApi('servidor', String(e))))
    return () => {
      ativo = false
    }
  }, [edicao, id, singular])

  function atualizar(campo: string, valor: string) {
    setDados((atual) =>
      campo.startsWith('endereco.')
        ? { ...atual, endereco: { ...atual.endereco, [campo.slice('endereco.'.length)]: valor } }
        : { ...atual, [campo]: valor },
    )
  }

  function valorDe(campo: string): string {
    return campo.startsWith('endereco.')
      ? dados.endereco[campo.slice('endereco.'.length) as keyof EnderecoFormulario]
      : ((dados as Record<string, unknown>)[campo] as string)
  }

  function focarPrimeiroErro(errosAtuais: ErrosDoFormulario) {
    const controles = formulario.current?.querySelectorAll<HTMLElement>('[name]') ?? []
    Array.from(controles).find((controle) => controle.getAttribute('name')! in errosAtuais)?.focus()
  }

  function mostrarErroDaApi(erro: unknown) {
    if (!(erro instanceof ErroApi)) {
      setErroGeral('Algo deu errado. Tente novamente.')
      return
    }
    if (erro.tipo === 'validacao' || erro.tipo === 'conflito') {
      const porCampo: ErrosDoFormulario = {}
      const gerais: string[] = []
      const nomesNaTela = new Set(
        Array.from(formulario.current?.querySelectorAll('[name]') ?? []).map((c) => c.getAttribute('name')),
      )
      for (const { campo, mensagem } of erro.campos) {
        if (campo && nomesNaTela.has(campo)) porCampo[campo] = mensagem
        else gerais.push(campo ? `${campo}: ${mensagem}` : mensagem)
      }
      // Erro de um campo sem input na tela (ex.: id) não pode sumir: vai para o aviso geral
      if (gerais.length > 0) setErroGeral(gerais.join(' '))
      setErros(porCampo)
      focarPrimeiroErro(porCampo)
      return
    }
    // O cliente HTTP é neutro ("Não encontrado."); aqui sabemos de qual entidade se trata
    setErroGeral(erro.tipo === 'nao-encontrado' ? `${maiuscula(singular)} não encontrado.` : erro.message)
  }

  async function salvar() {
    if (edicao && original) {
      await opcoes.atualizar(original, dados)
      return `${maiuscula(singular)} atualizado`
    }
    await opcoes.cadastrar(dados)
    return `${maiuscula(singular)} cadastrado`
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (enviandoAgora.current) return

    const errosLocais = opcoes.validar(dados, modo)
    setErros(errosLocais)
    setErroGeral(null)
    if (Object.keys(errosLocais).length > 0) {
      focarPrimeiroErro(errosLocais)
      return
    }

    enviandoAgora.current = true
    setEnviando(true)
    try {
      const aviso = await salvar()
      navigate(base, { state: { aviso } })
    } catch (erro) {
      mostrarErroDaApi(erro)
    } finally {
      enviandoAgora.current = false
      setEnviando(false)
    }
  }

  function texto(campo: string, extras: InputHTMLAttributes<HTMLInputElement> = {}) {
    return (props: PropsDoControle) => (
      <input
        {...props}
        {...extras}
        name={campo}
        value={valorDe(campo)}
        onChange={(e) => atualizar(campo, e.target.value)}
      />
    )
  }

  // Sem maxLength aqui: ele cortaria "87020-000" colado para "87020-00" antes de tirarmos o traço
  function numerico(campo: string, limite: number, extras: InputHTMLAttributes<HTMLInputElement> = {}) {
    return (props: PropsDoControle) => (
      <input
        {...props}
        {...extras}
        name={campo}
        inputMode="numeric"
        value={valorDe(campo)}
        onChange={(e) => atualizar(campo, e.target.value.replace(/\D/g, '').slice(0, limite))}
      />
    )
  }

  return {
    modo, base, singular, plural, edicao, formulario, dados, original, erroAoCarregar, erros, erroGeral, enviando,
    enviar, atualizar, valorDe, texto, numerico,
  }
}

export type FormularioDeCadastro = ReturnType<typeof useFormularioCadastro>
