import { apiClientes } from '../api/clientes'
import type { ClienteCadastro, ClienteDetalhe } from '../api/tipos'
import Campo from '../components/Campo'
import CamposEndereco from '../components/CamposEndereco'
import FormularioCadastro from '../components/FormularioCadastro'
import { calcularAlteracoes } from '../dominio/alteracoes'
import { apenasDigitos, formatarCpf } from '../dominio/cpf'
import { CLIENTES } from '../dominio/recursos'
import {
  clienteVazio, hojeNoFormatoIso, validarCliente, type DadosFormularioCliente, type ModoFormulario,
} from '../dominio/validacao'
import { useFormularioCadastro } from '../hooks/useFormularioCadastro'

export default function FormularioCliente({ modo }: { modo: ModoFormulario }) {
  const form = useFormularioCadastro<DadosFormularioCliente, ClienteDetalhe>({
    modo,
    base: CLIENTES.base,
    singular: CLIENTES.singular,
    plural: CLIENTES.plural,
    vazio: clienteVazio,
    detalhar: apiClientes.detalhar,
    paraFormulario,
    validar: validarCliente,
    cadastrar: (dados) => apiClientes.cadastrar(paraCadastro(dados)),
    atualizar: (original, dados) => apiClientes.atualizar(calcularAlteracoes(original, dados)),
  })
  const { erros, texto, valorDe, atualizar } = form

  return (
    <FormularioCadastro form={form}>
      <fieldset className="grupo">
        <legend>Dados do cliente</legend>
        <div className="grade">
          <Campo rotulo="Nome" erro={erros.nome}>
            {texto('nome', { autoComplete: 'name', maxLength: 100 })}
          </Campo>
          <Campo rotulo="E-mail" erro={erros.email} className="campo--metade">
            {texto('email', { type: 'email', autoComplete: 'email', maxLength: 100 })}
          </Campo>
          <Campo rotulo="Telefone" erro={erros.telefone} dica="Com DDD, só números" className="campo--metade">
            {texto('telefone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 20 })}
          </Campo>
          <Campo rotulo="CPF" erro={erros.cpf} dica="Pode colar com ou sem pontuação" className="campo--metade">
            {(props) => (
              // O estado guarda só os dígitos; o campo mostra a máscara 000.000.000-00
              <input
                {...props}
                name="cpf"
                inputMode="numeric"
                autoComplete="off"
                value={formatarCpf(valorDe('cpf'))}
                onChange={(e) => atualizar('cpf', apenasDigitos(e.target.value))}
              />
            )}
          </Campo>
          <Campo rotulo="Data de nascimento" erro={erros.dataNascimento} className="campo--metade">
            {(props) => (
              <input
                {...props}
                type="date"
                name="dataNascimento"
                max={ontem()}
                value={valorDe('dataNascimento')}
                onChange={(e) => atualizar('dataNascimento', e.target.value)}
              />
            )}
          </Campo>
        </div>
      </fieldset>

      <CamposEndereco form={form} />
    </FormularioCadastro>
  )
}

/** O seletor de data não deixa escolher hoje nem o futuro; a validação confirma ao enviar. */
function ontem(): string {
  const data = new Date(`${hojeNoFormatoIso()}T00:00:00`)
  data.setDate(data.getDate() - 1)
  const doisDigitos = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

function paraFormulario(cliente: ClienteDetalhe): DadosFormularioCliente {
  return {
    nome: cliente.nome,
    email: cliente.email,
    telefone: cliente.telefone,
    cpf: cliente.cpf,
    dataNascimento: cliente.dataNascimento,
    endereco: {
      ...cliente.endereco,
      numero: cliente.endereco.numero ?? '',
      complemento: cliente.endereco.complemento ?? '',
    },
  }
}

function paraCadastro(dados: DadosFormularioCliente): ClienteCadastro {
  const opcional = (valor: string) => (valor.trim() === '' ? null : valor)
  return {
    ...dados,
    endereco: { ...dados.endereco, numero: opcional(dados.endereco.numero), complemento: opcional(dados.endereco.complemento) },
  }
}
