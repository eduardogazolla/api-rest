import { apiMedicos } from '../api/medicos'
import type { Especialidade, MedicoCadastro, MedicoDetalhe } from '../api/tipos'
import Campo from '../components/Campo'
import CamposEndereco from '../components/CamposEndereco'
import FormularioCadastro from '../components/FormularioCadastro'
import { calcularAlteracoes } from '../dominio/alteracoes'
import { ESPECIALIDADES } from '../dominio/constantes'
import { MEDICOS } from '../dominio/recursos'
import { medicoVazio, validarMedico, type DadosFormularioMedico, type ModoFormulario } from '../dominio/validacao'
import { useFormularioCadastro } from '../hooks/useFormularioCadastro'

const BLOQUEADO = 'Não pode ser alterado'

export default function FormularioMedico({ modo }: { modo: ModoFormulario }) {
  const form = useFormularioCadastro<DadosFormularioMedico, MedicoDetalhe>({
    modo,
    base: MEDICOS.base,
    singular: MEDICOS.singular,
    plural: MEDICOS.plural,
    vazio: medicoVazio,
    detalhar: apiMedicos.detalhar,
    paraFormulario,
    validar: validarMedico,
    cadastrar: (dados) => apiMedicos.cadastrar(paraCadastro(dados)),
    atualizar: (original, dados) => apiMedicos.atualizar(calcularAlteracoes(original, dados)),
  })
  const { edicao, erros, texto, numerico, valorDe, atualizar } = form

  return (
    <FormularioCadastro form={form}>
      <fieldset className="grupo">
        <legend>Dados do médico</legend>
        <div className="grade">
          <Campo rotulo="Nome" erro={erros.nome}>
            {texto('nome', { autoComplete: 'name', maxLength: 100 })}
          </Campo>
          <Campo rotulo="E-mail" erro={erros.email} dica={edicao ? BLOQUEADO : undefined} className="campo--metade">
            {texto('email', { type: 'email', autoComplete: 'email', readOnly: edicao, maxLength: 100 })}
          </Campo>
          <Campo rotulo="Telefone" erro={erros.telefone} dica="Com DDD, só números" className="campo--metade">
            {texto('telefone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 20 })}
          </Campo>
          <Campo rotulo="CRM" erro={erros.crm} dica={edicao ? BLOQUEADO : 'De 4 a 6 dígitos'} className="campo--terco">
            {numerico('crm', 6, { readOnly: edicao })}
          </Campo>
          <Campo
            rotulo="Especialidade"
            erro={erros.especialidade}
            dica={edicao ? BLOQUEADO : undefined}
            className="campo--dois-tercos"
          >
            {(props) => (
              <select
                {...props}
                name="especialidade"
                value={valorDe('especialidade')}
                disabled={edicao}
                onChange={(e) => atualizar('especialidade', e.target.value)}
              >
                <option value="">Escolha a especialidade</option>
                {ESPECIALIDADES.map(({ valor, rotulo }) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>
      </fieldset>

      <CamposEndereco form={form} />
    </FormularioCadastro>
  )
}

function paraFormulario(medico: MedicoDetalhe): DadosFormularioMedico {
  return {
    nome: medico.nome,
    email: medico.email,
    telefone: medico.telefone,
    crm: medico.crm,
    especialidade: medico.especialidade,
    endereco: {
      ...medico.endereco,
      numero: medico.endereco.numero ?? '',
      complemento: medico.endereco.complemento ?? '',
    },
  }
}

function paraCadastro(dados: DadosFormularioMedico): MedicoCadastro {
  const opcional = (valor: string) => (valor.trim() === '' ? null : valor)
  return {
    ...dados,
    especialidade: dados.especialidade as Especialidade,
    endereco: { ...dados.endereco, numero: opcional(dados.endereco.numero), complemento: opcional(dados.endereco.complemento) },
  }
}
