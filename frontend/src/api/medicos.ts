import { criarApiDeCadastro } from './recurso'
import type { MedicoCadastro, MedicoDetalhe, MedicoListagem } from './tipos'

export const apiMedicos = criarApiDeCadastro<MedicoListagem, MedicoDetalhe, MedicoCadastro>('/medicos')
