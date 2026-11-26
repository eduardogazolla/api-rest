# Implementation Plan: Interface web de gestão de médicos

**Branch**: `pdi/frontend` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-frontend-medicos/spec.md`

**Design de origem**: [docs/superpowers/specs/2026-11-26-frontend-design.md](../../docs/superpowers/specs/2026-11-26-frontend-design.md)

## Summary

Criar uma SPA em React + TypeScript (Vite) na pasta `frontend/`, que é compilada e empacotada
como recurso estático no `.jar` do Spring Boot. A tela fica em `/` e a API na mesma origem.

A API ganha quatro ajustes, todos com testes:
- `GET /medicos/{id}` para detalhar um médico;
- `GET /medicos/inativos` para listar os inativos;
- erros de validação e de duplicidade no formato `[{campo, mensagem}]` (400 e 409);
- validação de formato do endereço na edição.

Os contratos que já existem não mudam, e o Swagger continua em `/swagger-ui/index.html`.

## Technical Context

**Language/Version**: Java 17 (back-end) · TypeScript 5 + React 19 (front-end), Node 24.

**Primary Dependencies**:
- Back-end (sem dependências novas): Spring Boot 4.1.1 (webmvc, data-jpa, validation, flyway), springdoc 3.1.1.
- Front-end: Vite, React, React DOM, React Router.

**Storage**: MySQL (local), PostgreSQL (Portal DB1), H2 (testes). **Não há migration nova**: as
colunas `email` e `crm` já são `unique`.

**Testing**:
- Back-end: JUnit 5, Mockito, MockMvc (`@SpringBootTest` + perfil `test` com H2).
- Front-end: Vitest, jsdom, @testing-library/react, @testing-library/user-event e
  @testing-library/jest-dom.
- E2E manual: Playwright MCP e Lighthouse (acessibilidade) contra a aplicação local.

**Target Platform**: navegadores modernos (desktop e celular). O servidor é um container Linux
no Portal DB1.

**Project Type**: aplicação web: API REST existente mais uma SPA servida pelo mesmo `.jar`.

**Performance Goals**: lista visível em < 2 s (SC-007). Bundle do front < 250 kB gzip.

**Constraints**:
- `mvn test` sem Node e sem MySQL.
- Contratos atuais intactos.
- Mesma origem, sem CORS.
- Rotas de tela fora de `/medicos`.
- Português.

**Scale/Scope**: dezenas a centenas de médicos, 4 telas e 7 endpoints (5 existentes e 2 novos).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano atende | Status |
|---|---|---|
| I. Camadas | Endpoints novos: Controller de 1 linha → `MedicoService` → `MedicoRepository`. Os DTOs novos são records. Injeção pelo construtor. | ✅ |
| II. Testes | Cada tarefa de código tem teste positivo e de exceção, escrito antes (TDD). Nomes no padrão `deve…Quando…`. `mvn test` continua sem Node, porque o build do front fica fora do `pom.xml`. | ✅ |
| III. Erros | `CadastroDuplicadoException` vira 409. `MethodArgumentNotValidException` vira 400, ambos com `[{campo, mensagem}]` em português. `DataIntegrityViolationException` vira 409, para a corrida entre a checagem e o insert. O front mostra o erro embaixo do campo. | ✅ |
| IV. Simplicidade | Front só com React, React Router e Vite, mais as libs de teste. Sem UI kit e sem gerenciador de estado. O aviso pós-ação usa o `state` do React Router, sem Context. | ✅ |
| V. Um deploy e contrato estável | O Dockerfile compila o front e copia o `dist/` para `static/`. Rotas de tela: `/`, `/inativos`, `/cadastro`, `/editar/{id}`. Endpoints existentes inalterados. O JSON do `PUT` continua igual, só ganha validação de formato. | ✅ |
| Restrições | Sem migration nova. Nenhum segredo. Sem autenticação (fica com o SSO). | ✅ |

**Re-check pós-design (Fase 1)**: ✅ sem violações. Ver [research.md](./research.md) para a
justificativa de cada decisão.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-medicos/
├── plan.md              # Este arquivo
├── research.md          # Fase 0: decisões técnicas
├── data-model.md        # Fase 1: DTOs e tipos
├── quickstart.md        # Fase 1: como rodar e verificar
├── contracts/
│   └── api-medicos.md   # Fase 1: contrato HTTP (novos e alterados)
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/main/java/med/voll/api/
├── endereco/
│   ├── DadosEndereco.java              # + construtor a partir de Endereco
│   ├── DadosAtualizacaoEndereco.java   # NOVO: só regras de formato
│   └── Endereco.java                   # atualizarInformacoes(DadosAtualizacaoEndereco)
├── infra/
│   ├── HomeController.java             # "/" e rotas de tela → forward:/index.html
│   └── TratadorDeErros.java            # + 400 por campo, 409 duplicidade/integridade
└── medico/
    ├── CadastroDuplicadoException.java # NOVO (campo, mensagem)
    ├── DadosAtualizacaoMedico.java     # endereco: @Valid DadosAtualizacaoEndereco
    ├── DadosCadastroMedico.java        # mensagens explícitas em português
    ├── DadosDetalhamentoMedico.java    # NOVO
    ├── MedicoController.java           # + GET /{id}, GET /inativos
    ├── MedicoRepository.java           # + findAllByAtivoFalse, existsByEmail, existsByCrm
    └── MedicoService.java              # + detalhar, listarInativos, checagem de duplicidade

src/test/java/med/voll/api/  (mesmos pacotes; testes novos e ajustados)

frontend/
├── index.html
├── package.json · package-lock.json · tsconfig*.json · vite.config.ts
└── src/
    ├── main.tsx · App.tsx                 # rotas e layout
    ├── api/
    │   ├── cliente.ts                     # requisitar<T>() e ErroApi
    │   ├── medicos.ts                     # funções por endpoint
    │   └── tipos.ts                       # espelho dos DTOs
    ├── dominio/
    │   ├── constantes.ts                  # ESPECIALIDADES, UFS
    │   └── validacao.ts                   # validarMedico()
    ├── components/
    │   ├── Cabecalho.tsx · TabelaMedicos.tsx · Paginacao.tsx
    │   ├── Campo.tsx · ModalConfirmacao.tsx · Aviso.tsx
    ├── pages/
    │   ├── ListaMedicos.tsx               # modo "ativos" | "inativos"
    │   └── FormularioMedico.tsx           # modo "cadastro" | "edicao"
    ├── styles/ tokens.css · global.css
    └── test/ setup.ts                     # jest-dom e mock de fetch

Dockerfile        # + etapa node:24 (npm ci, npm test, npm run build)
.dockerignore     # NOVO: target/, frontend/node_modules, frontend/dist
.gitignore        # + frontend/node_modules, frontend/dist
README.md         # + seção "Front-end"
```

**Structure Decision**: um repositório com o back-end Maven na raiz, como já é hoje, e o front
em `frontend/`. O front não ganha um `src/` paralelo ao Java, porque o build dele é
independente (Vite) e só entra no Dockerfile.

## Complexity Tracking

Nenhuma violação a justificar.
