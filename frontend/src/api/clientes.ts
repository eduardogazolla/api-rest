import { criarApiDeCadastro } from './recurso'
import type { ClienteCadastro, ClienteDetalhe, ClienteListagem } from './tipos'

export const apiClientes = criarApiDeCadastro<ClienteListagem, ClienteDetalhe, ClienteCadastro>('/clientes')
