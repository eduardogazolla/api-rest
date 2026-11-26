import { apiClientes } from '../api/clientes'
import { apiMedicos } from '../api/medicos'
import type { ApiDeCadastro } from '../api/recurso'
import type { ClienteListagem, MedicoListagem } from '../api/tipos'
import type { Coluna } from '../components/Tabela'
import { rotuloDaEspecialidade } from './constantes'
import { formatarCpf } from './cpf'

/**
 * Tudo o que muda de uma área (médicos, clientes) para outra na tela de lista.
 * O comportamento (paginação, ordenação, exclusão, reativação) é um só, em ListaCadastros.
 */
export interface AreaDeCadastro<L extends { id: number; nome: string }> {
  /** Rota de tela da área, sempre sob /app. */
  base: string
  /** Em minúsculas; médico e cliente são masculinos, então as frases não precisam de flexão. */
  singular: string
  plural: string
  api: Pick<ApiDeCadastro<L, unknown, unknown>, 'listarAtivos' | 'listarInativos' | 'excluir' | 'reativar'>
  colunas: Coluna<L>[]
}

export const maiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

export const MEDICOS: AreaDeCadastro<MedicoListagem> = {
  base: '/app/medicos',
  singular: 'médico',
  plural: 'médicos',
  api: apiMedicos,
  colunas: [
    { campo: 'nome', rotulo: 'Nome', className: 'coluna-nome tabela__nome', celula: (m) => m.nome },
    { campo: 'email', rotulo: 'E-mail', className: 'coluna-email tabela__email', celula: (m) => m.email },
    { campo: 'crm', rotulo: 'CRM', celula: (m) => <span className="carimbo">CRM {m.crm}</span> },
    {
      campo: 'especialidade',
      rotulo: 'Especialidade',
      celula: (m) => (
        <span className="especialidade" data-especialidade={m.especialidade}>
          {rotuloDaEspecialidade(m.especialidade)}
        </span>
      ),
    },
  ],
}

export const CLIENTES: AreaDeCadastro<ClienteListagem> = {
  base: '/app/clientes',
  singular: 'cliente',
  plural: 'clientes',
  api: apiClientes,
  colunas: [
    { campo: 'nome', rotulo: 'Nome', className: 'coluna-nome tabela__nome', celula: (c) => c.nome },
    { campo: 'email', rotulo: 'E-mail', className: 'coluna-email tabela__email', celula: (c) => c.email },
    // A API guarda só dígitos; quem atende lê o CPF com pontuação
    { campo: 'cpf', rotulo: 'CPF', celula: (c) => <span className="cpf">{formatarCpf(c.cpf)}</span> },
  ],
}
