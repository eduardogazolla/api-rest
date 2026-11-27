# Contrato: rotas de tela

A regra é simples: **`/app/**` é tela, o resto é API, Swagger ou arquivo estático.**

| Rota | Tela | Spring | React |
|---|---|---|---|
| `/` | – | encaminha para `index.html` | redireciona para `/app/medicos` |
| `/app` | – | encaminha | redireciona para `/app/medicos` |
| `/app/medicos` | Médicos ativos | encaminha | `ListaCadastros(MEDICOS, ativos)` |
| `/app/medicos/inativos` | Médicos inativos | encaminha | `ListaCadastros(MEDICOS, inativos)` |
| `/app/medicos/cadastro` | Novo médico | encaminha | `FormularioMedico(cadastro)` |
| `/app/medicos/editar/:id` | Editar médico | encaminha | `FormularioMedico(edicao)` |
| `/app/clientes` | Clientes ativos | encaminha | `ListaCadastros(CLIENTES, ativos)` |
| `/app/clientes/inativos` | Clientes inativos | encaminha | `ListaCadastros(CLIENTES, inativos)` |
| `/app/clientes/cadastro` | Novo cliente | encaminha | `FormularioCliente(cadastro)` |
| `/app/clientes/editar/:id` | Editar cliente | encaminha | `FormularioCliente(edicao)` |
| `/app/qualquer-outra` | Página não encontrada | encaminha | fallback `*` |
| `/inativos`, `/cadastro`, `/editar/7` | **removidas** | 404 do servidor | – |

O aviso pós-ação passa pela navegação (`state.aviso`) para a lista da área (`/app/medicos` ou `/app/clientes`).

A API (`/medicos/**`, `/clientes/**`), o `/health`, o `/swagger-ui/**` e o `/v3/**` não mudam.
