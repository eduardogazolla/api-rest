import { UFS } from '../dominio/constantes'
import type { FormularioDeCadastro } from '../hooks/useFormularioCadastro'
import Campo from './Campo'

// Os limites de maxLength seguem as colunas do banco (e o @Size dos DTOs)
export default function CamposEndereco({ form }: { form: FormularioDeCadastro }) {
  const { erros, texto, numerico, valorDe, atualizar } = form

  return (
    <fieldset className="grupo">
      <legend>Endereço</legend>
      <div className="grade">
        <Campo rotulo="CEP" erro={erros['endereco.cep']} dica="8 dígitos, sem traço" className="campo--terco">
          {numerico('endereco.cep', 8, { autoComplete: 'postal-code' })}
        </Campo>
        <Campo rotulo="Logradouro" erro={erros['endereco.logradouro']} className="campo--dois-tercos">
          {texto('endereco.logradouro', { autoComplete: 'address-line1', maxLength: 100 })}
        </Campo>
        <Campo rotulo="Número" opcional erro={erros['endereco.numero']} className="campo--terco">
          {texto('endereco.numero', { maxLength: 20 })}
        </Campo>
        <Campo rotulo="Complemento" opcional erro={erros['endereco.complemento']} className="campo--dois-tercos">
          {texto('endereco.complemento', { autoComplete: 'address-line2', maxLength: 100 })}
        </Campo>
        <Campo rotulo="Bairro" erro={erros['endereco.bairro']} className="campo--metade">
          {texto('endereco.bairro', { maxLength: 100 })}
        </Campo>
        <Campo rotulo="Cidade" erro={erros['endereco.cidade']} className="campo--terco">
          {texto('endereco.cidade', { autoComplete: 'address-level2', maxLength: 100 })}
        </Campo>
        <Campo rotulo="UF" erro={erros['endereco.uf']} className="campo--sexto">
          {(props) => (
            <select
              {...props}
              name="endereco.uf"
              value={valorDe('endereco.uf')}
              autoComplete="address-level1"
              onChange={(e) => atualizar('endereco.uf', e.target.value)}
            >
              <option value="">--</option>
              {UFS.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </select>
          )}
        </Campo>
      </div>
    </fieldset>
  )
}
