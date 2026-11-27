# Implementation Plan: Telas de clientes

**Branch**: `pdi/clientes-frontend` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-clientes-frontend/spec.md`

**Design de origem**: [docs/superpowers/specs/2026-11-26-clientes-frontend-design.md](../../docs/superpowers/specs/2026-11-26-clientes-frontend-design.md)

## Summary

As telas de médicos são refatoradas em peças genéricas: API por recurso, tabela, página de lista, hook de
formulário e bloco de endereço. Todas as rotas de tela passam para `/app`. As telas de clientes saem dessas
mesmas peças, com o que é só delas: colunas, campos, CPF com máscara e data de nascimento.

O Spring encaminha `/app/**` para a SPA. A API não muda.

## Technical Context

**Language/Version**: TypeScript 7 e React 19 (front-end), Java 17 (só o `HomeController`).

**Primary Dependencies**: React Router 8, Vite 8, Vitest 5 e Testing Library. **Nenhuma dependência nova.**

**Storage**: n/a (consome a API existente).

**Testing**: Vitest com `fetch` simulado (`src/test/fetchFalso.ts`) e MockMvc no `RotasDaTelaTest`. Ao final, Playwright e Lighthouse contra o `.jar` no banco `vollmed_e2e`.

**Target Platform**: navegadores modernos (desktop e celular), servidos pelo `.jar` no Portal DB1.

**Project Type**: SPA mais API REST na mesma origem.

**Performance Goals**: bundle < 250 kB gzip (hoje 87 kB).

**Constraints**:
- a API fica intacta;
- sem bibliotecas novas;
- `mvn test` sem Node;
- os textos que a pessoa vê nas telas de médico não mudam, só os endereços e a navegação;
- nada de comportamento duplicado entre médicos e clientes.

**Scale/Scope**: 8 telas (4 por entidade) e cerca de 10 arquivos novos ou refatorados no front.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano atende | Status |
|---|---|---|
| I. Camadas | O front continua separado em `api/` (HTTP), `dominio/` (regras), `components/` e `pages/`. O back só ganha um mapeamento de rota no `HomeController`. | ✅ |
| II. Testes | TDD por fase. Os testes de médicos são ajustados só nas rotas e no seletor, e os de clientes espelham os de médicos. O `RotasDaTelaTest` cobre `/app/**`. | ✅ |
| III. Erros | O 404 fica neutro no cliente HTTP, e cada tela mostra o texto da entidade. Os erros por campo continuam como estão (`[{campo, mensagem}]`). | ✅ |
| IV. Simplicidade | Sem bibliotecas novas. As peças genéricas **removem** duplicação, e não são abstração "para o futuro": servem às duas entidades já agora. | ✅ |
| V. Um deploy e contrato estável | **Emenda 1.0.1 (PATCH)**: "rotas de tela MUST NOT começar com `/medicos`" passa a ser "rotas de tela ficam em `/app`; `/medicos` e `/clientes` são da API". A intenção (tela e API não colidem) se mantém. A API não muda. | ✅ (com a emenda) |

**Re-check pós-design**: ✅ (ver research.md).

## Project Structure

### Documentation (this feature)

```text
specs/003-clientes-frontend/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/rotas-de-tela.md
└── tasks.md
```

### Source Code

```text
frontend/src/
├── api/
│   ├── cliente.ts            # 404 neutro ("Não encontrado.")
│   ├── recurso.ts            # NOVO: criarApiDeCadastro(base) com listar, detalhar, cadastrar, atualizar, excluir e reativar
│   ├── medicos.ts            # vira apiMedicos = criarApiDeCadastro('/medicos')
│   ├── clientes.ts           # NOVO: apiClientes = criarApiDeCadastro('/clientes')
│   └── tipos.ts              # + ClienteListagem, ClienteDetalhe, ClienteCadastro
├── dominio/
│   ├── alteracoes.ts         # calcularAlteracoes genérico (nome, telefone, endereço)
│   ├── cpf.ts                # NOVO: formatarCpf, apenasDigitos, cpfValido
│   ├── recursos.ts           # NOVO: configuração de cada área (rotas, textos, colunas e API)
│   └── validacao.ts          # validarEndereco compartilhado + validarMedico + validarCliente
├── components/
│   ├── Tabela.tsx            # NOVO, genérica por colunas (substitui TabelaMedicos)
│   ├── SeletorSituacao.tsx   # NOVO: Ativos | Inativos
│   ├── CamposEndereco.tsx    # NOVO: bloco de endereço compartilhado
│   └── Cabecalho.tsx         # Médicos | Clientes
├── hooks/
│   └── useFormularioCadastro.ts  # NOVO: carregar, validar, enviar, erros por campo, foco e aviso
├── pages/
│   ├── ListaCadastros.tsx    # NOVO, genérica (substitui a lógica de ListaMedicos)
│   ├── FormularioMedico.tsx  # fino: campos do médico + hook + CamposEndereco
│   └── FormularioCliente.tsx # NOVO, fino
└── App.tsx                   # rotas /app/... e / → /app/medicos

src/main/java/med/voll/api/infra/HomeController.java   # "/", "/app", "/app/**"
src/test/java/med/voll/api/infra/RotasDaTelaTest.java  # novas rotas
.specify/memory/constitution.md                        # 1.0.1
frontend/vite.config.ts                                # proxy /clientes
```

**Structure Decision**: sai `ListaMedicos.tsx` e entra a `ListaCadastros` configurada por área (`dominio/recursos.ts`).
Sai `TabelaMedicos.tsx` e entra a `Tabela` com as colunas de cada área. Os testes acompanham os arquivos.

## Complexity Tracking

| Ponto | Por quê | Alternativa mais simples recusada |
|---|---|---|
| Genéricos (`ListaCadastros<T>`, `Tabela<T>`, `criarApiDeCadastro<…>`) | Duas entidades com o mesmo comportamento | Copiar e colar, o que viola a regra 1 do `Rules.md` e foi definido como anti-objetivo no design |
