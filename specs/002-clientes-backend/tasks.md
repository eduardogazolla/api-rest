---

description: "Lista de tarefas do back-end de clientes"
---

# Tasks: Cadastro de clientes (back-end)

**Input**: Design documents from `/specs/002-clientes-backend/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-clientes.md, quickstart.md

**Tests**: OBRIGATÓRIOS (constituição, princípio II). Em cada história, o teste é escrito primeiro, falha, e só
depois vem a implementação. Os nomes seguem `deve[Resultado]Quando[Condição]`, com `@DisplayName` em português.
Os testes MockMvc compartilham o H2: cada teste usa CPF e e-mail próprios, todos com dígitos verificadores válidos.

**Organization**: tarefas agrupadas por história de usuário, como na feature 001.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 a US5 da spec

## Path Conventions

`src/main/java/med/voll/api/...` e `src/test/java/med/voll/api/...`, a partir da raiz.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: criar a tabela `clientes` nos dois dialetos.

- [X] T001 Criar `src/main/resources/db/migration/V4__create-table-clientes.sql` com as colunas MySQL de data-model.md "Tabela `clientes`"
- [X] T002 [P] Criar `src/main/resources/db/postgresql/V4__create-table-clientes.sql` com as colunas PostgreSQL da mesma tabela de data-model.md
- [X] T003 Rodar `./mvnw test -Dtest=ApiApplicationTests` e confirmar que a V4 aplica no H2 (modo MySQL)

**Checkpoint**: `./mvnw test` continua verde, com 69 testes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: deixar a infra de erros servindo aos dois domínios (research.md R3, R4 e R5).

- [X] T004 Mover `src/main/java/med/voll/api/medico/CadastroDuplicadoException.java` para `src/main/java/med/voll/api/infra/CadastroDuplicadoException.java` e ajustar os imports de `MedicoService`, `TratadorDeErros` e `MedicoServiceTest`. Todos os testes continuam verdes
- [X] T005 Em `src/test/java/med/voll/api/infra/TratadorDeErrosTest.java`, mudar o texto esperado para "Já existe um cadastro com estes dados.". Em `src/test/java/med/voll/api/medico/MedicoControllerOrdenacaoTest.java`, adicionar `deveExplicarOrdenacaoComCampoGenericoQuandoSortForInvalido`, com `$.mensagem` igual a "Parâmetro sort inválido. Use um campo da listagem, por exemplo: nome ou nome,desc". Confirmar que FALHA
- [X] T006 Criar `deveRetornar400ApontandoCampoQuandoJsonTiverValorIlegivel` em `src/test/java/med/voll/api/medico/MedicoControllerValidacaoTest.java`: POST `/medicos` com `"especialidade":"PEDIATRIA"` deve dar 400 com `$[0].campo == "especialidade"` e `$[0].mensagem == "formato inválido"`. Confirmar que FALHA
- [X] T007 Implementar em `src/main/java/med/voll/api/infra/TratadorDeErros.java`:
  - as mensagens genéricas de research.md R5;
  - o handler de `HttpMessageNotReadableException` de research.md R3, com o campo tirado do caminho da exceção do Jackson e `campo: null` quando não houver caminho.
  - T005 e T006 devem passar, e o `./mvnw test` inteiro também.

**Checkpoint**: infra pronta, e os médicos verdes, só com o texto das mensagens mudado.

---

## Phase 3: User Story 1 - Cadastrar cliente (Priority: P1) 🎯 MVP

**Goal**: `POST /clientes` com validação por campo e 409 de duplicidade.

**Independent Test**: os cenários 1 a 3 do quickstart.md.

### Tests for User Story 1

- [X] T008 [P] [US1] Criar `src/test/java/med/voll/api/cliente/DadosCadastroClienteTest.java` (com `Validator`):
  - `deveAceitarCadastroValido`;
  - `deveRecusarCpfComDezDigitos`;
  - `deveRecusarCpfComPontuacao`, que espera "deve ter 11 dígitos, sem pontuação";
  - `deveRecusarCpfComDigitoVerificadorInvalido`, com o CPF `52998224724`, que espera "CPF inválido";
  - `deveRecusarDataDeNascimentoNoFuturo` e `deveRecusarDataDeNascimentoHoje`;
  - `deveRecusarNomeComMaisDeCemCaracteres`.
- [X] T009 [P] [US1] Criar `src/test/java/med/voll/api/cliente/ClienteTest.java` com `deveCriarClienteAtivoAoCadastrar`, `deveInativarClienteAoExcluir` e `deveReativarClienteInativo`
- [X] T010 [P] [US1] Criar `src/test/java/med/voll/api/cliente/ClienteServiceTest.java` (Mockito):
  - `deveLancarCadastroDuplicadoQuandoCpfJaExistir` (`campo == "cpf"`, `save` nunca chamado);
  - `deveLancarCadastroDuplicadoQuandoEmailJaExistir`;
  - `deveChecarCpfAntesDoEmailQuandoAmbosExistirem`;
  - `deveSalvarClienteAtivoQuandoCpfEEmailForemIneditos`.
- [X] T011 [P] [US1] Criar `src/test/java/med/voll/api/cliente/ClienteControllerCadastroTest.java` (MockMvc e H2):
  - `deveRetornar200QuandoCadastroForValido`;
  - `deveRetornar400ComCampoCpfQuandoCpfForInvalido`;
  - `deveRetornar400ComCampoDataNascimentoQuandoDataForIlegivel` (`"31/02/1990"`);
  - `deveRetornar409ComCampoCpfQuandoCpfRepetir`;
  - `deveRetornar409ComCampoEmailQuandoEmailRepetir`;
  - `deveRetornar409QuandoCpfPertencerAClienteInativo`, que salva pelo repository, chama `excluir()` e salva de novo.

### Implementation for User Story 1

- [X] T012 [US1] Criar `src/main/java/med/voll/api/cliente/DadosCadastroCliente.java` com as regras de data-model.md `DadosCadastroCliente.nome`, `.email`, `.telefone`, `.cpf`, `.dataNascimento` e `.endereco`, e `@Schema` com exemplos. O T008 deve passar
- [X] T013 [US1] Criar `src/main/java/med/voll/api/cliente/Cliente.java` (entidade `clientes`, `@Embedded Endereco`, construtor a partir do cadastro, `excluir()` e `ativar()`), conforme data-model.md `Cliente`. O T009 deve passar
- [X] T014 [US1] Criar `src/main/java/med/voll/api/cliente/ClienteRepository.java` com `existsByCpf` e `existsByEmail` (data-model.md `ClienteRepository`)
- [X] T015 [US1] Criar `src/main/java/med/voll/api/cliente/ClienteService.java` com `cadastrar` e `validarDuplicidade` (research.md R6). As mensagens são as de contracts/api-clientes.md. O T010 deve passar
- [X] T016 [US1] Criar `src/main/java/med/voll/api/cliente/ClienteController.java` (`@RequestMapping("clientes")`, `@Tag(name = "Clientes")`) com `POST`, documentando 200, 400 e 409 como em `MedicoController`. O T011 deve passar

**Checkpoint**: cadastro de cliente funcionando de ponta a ponta.

---

## Phase 4: User Story 2 - Listar clientes ativos (Priority: P1)

**Goal**: `GET /clientes` paginado e ordenado, só com ativos.

**Independent Test**: o cenário 4 do quickstart.md.

- [X] T017 [P] [US2] Em `ClienteServiceTest.java`, adicionar `deveConverterClientesAtivosParaDadosDeListagem` e `deveRetornarPaginaVaziaQuandoNaoHouverClientesAtivos`
- [X] T018 [P] [US2] Criar `src/test/java/med/voll/api/cliente/ClienteControllerListagemTest.java`:
  - `deveListarSomenteAtivosOrdenadosPorNome`;
  - `deveRetornar400QuandoSortForInvalido`;
  - `deveRetornar200QuandoSortForValido` (`cpf,desc`).
- [X] T019 [US2] Criar `src/main/java/med/voll/api/cliente/DadosListagemCliente.java` (data-model.md "Saída") e `findAllByAtivoTrue`. Implementar `ClienteService.listar` e o `GET` com `@PageableDefault(size = 10, sort = {"nome"})` e `@ParameterObject`. T017 e T018 devem passar

---

## Phase 5: User Story 3 - Detalhar cliente (Priority: P2)

**Goal**: `GET /clientes/{id}` completo, ativo ou inativo.

**Independent Test**: o cenário 5 do quickstart.md.

- [X] T020 [P] [US3] Em `ClienteServiceTest.java`, adicionar `deveDetalharClienteInativoComTodosOsDados` e `deveLancarExcecaoAoDetalharClienteInexistente`
- [X] T021 [P] [US3] Criar `src/test/java/med/voll/api/cliente/ClienteControllerDetalhamentoTest.java`:
  - `deveRetornar200ComDataDeNascimentoEEnderecoQuandoDetalhar` (`$.dataNascimento == "1990-05-20"`, `$.endereco.cep`, `$.ativo`);
  - `deveRetornar404QuandoClienteNaoExistir`;
  - `deveRetornar400QuandoIdNaoForNumero`.
- [X] T022 [US3] Criar `src/main/java/med/voll/api/cliente/DadosDetalhamentoCliente.java` (data-model.md "Saída"), `ClienteService.detalhar` com `buscarClientePorId` e `@GetMapping("/{id}")`. T020 e T021 devem passar

---

## Phase 6: User Story 4 - Atualizar cliente (Priority: P2)

**Goal**: `PUT /clientes` parcial (nome, telefone e endereço).

**Independent Test**: o cenário 6 do quickstart.md.

- [X] T023 [P] [US4] Criar `src/test/java/med/voll/api/cliente/DadosAtualizacaoClienteTest.java`:
  - `deveAceitarCamposNulos`;
  - `deveRecusarNomeEmBranco`;
  - `deveRecusarTelefoneEmBranco`;
  - `deveRecusarIdAusente`.
- [X] T024 [P] [US4] Em `ClienteTest.java`, adicionar `deveAtualizarApenasOTelefoneQuandoSoOTelefoneForInformado` e `naoDeveAlterarNadaQuandoTodosOsCamposForemNulos`
- [X] T025 [P] [US4] Em `ClienteServiceTest.java`, adicionar `deveAtualizarNomeDoCliente` e `deveLancarExcecaoAoAtualizarClienteInexistente`
- [X] T026 [P] [US4] Criar `src/test/java/med/voll/api/cliente/ClienteControllerAtualizacaoTest.java`:
  - `deveAlterarSoOTelefone`;
  - `deveRetornar400QuandoNomeEmBranco`;
  - `deveRetornar400ApontandoEnderecoCepQuandoCepInvalido`;
  - `deveApagarComplementoQuandoAtualizarComTextoVazio`;
  - `deveRetornar404QuandoAtualizarClienteInexistente`.
- [X] T027 [US4] Criar `src/main/java/med/voll/api/cliente/DadosAtualizacaoCliente.java` (data-model.md `DadosAtualizacaoCliente.id`, `.nome`, `.telefone` e `.endereco`). Implementar `Cliente.atualizarInformacoes`, `ClienteService.atualizar` e o `@PutMapping`, documentando 400 e 404. T023 a T026 devem passar

---

## Phase 7: User Story 5 - Excluir, listar inativos e reativar (Priority: P2)

**Goal**: `DELETE /clientes/{id}`, `GET /clientes/inativos` e `PATCH /clientes/{id}/ativar`.

**Independent Test**: o cenário 7 do quickstart.md.

- [X] T028 [P] [US5] Em `ClienteServiceTest.java`, adicionar:
  - `deveInativarClienteAoExcluir`;
  - `deveLancarExcecaoAoExcluirClienteInexistente`;
  - `deveReativarClienteInativo`;
  - `deveLancarExcecaoAoAtivarClienteInexistente`;
  - `deveListarSomenteInativosQuandoListarInativos`.
- [X] T029 [P] [US5] Criar `src/test/java/med/voll/api/cliente/ClienteControllerInativosTest.java`:
  - `deveMoverParaInativosQuandoExcluir`;
  - `deveVoltarParaAtivosQuandoReativar`;
  - `deveRetornar404QuandoExcluirOuReativarInexistente`;
  - `naoDeveConfundirInativosComIdQuandoChamarRotaLiteral`;
  - `deveRetornar400QuandoSortDeInativosForInvalido`.
- [X] T030 [US5] Implementar `findAllByAtivoFalse`, `ClienteService.excluir`, `ativar` e `listarInativos`, e no controller `@DeleteMapping("/{id}")`, `@PatchMapping("/{id}/ativar")` e `@GetMapping("/inativos")`, cada um com `@Operation` e `@ApiResponse`. T028 e T029 devem passar

**Checkpoint**: as 7 operações de clientes funcionando (SC-001).

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T031 Em `src/test/java/med/voll/api/infra/SwaggerDocumentacaoTest.java`, adicionar `deveDocumentarAsSeteOperacoesDeClientes`, que confere os paths `/clientes`, `/clientes/{id}`, `/clientes/inativos` e `/clientes/{id}/ativar` com seus métodos, e a tag "Clientes"
- [ ] T032 [P] Atualizar o `README.md`: "Funcionalidades", "Estrutura de diretórios" (pacote `cliente/` e a migration V4), "Endpoints" (tabela de clientes), "Respostas" (400 de JSON ilegível), "Testes" (as classes novas) e "Modelo de domínio" (`Cliente`)
- [ ] T033 Rodar `./mvnw test` (todos verdes) e `cd frontend && npm test` (continua verde). Conferir que não sobrou código morto
- [ ] T034 Rodar o roteiro de quickstart.md contra `vollmed_e2e` (nunca `vollmed_api`) e registrar o resultado
- [ ] T035 Fazer a revisão de código da branch (`/code-review high`) e aplicar o que for procedente
- [ ] T036 Fazer push da `pdi/clientes-backend` e abrir o PR para a `main`, **sem atribuição do Claude**

---

## Dependencies & Execution Order

- **Setup (F1)** e depois **Fundação (F2)**: bloqueiam todas as histórias.
- **US1 (F3)**: cria a entidade, o repository, o service e o controller. **Todas as outras histórias dependem dela.**
- **US2 a US5 (F4 a F7)**: dependem da US1 e mexem nos mesmos arquivos (`ClienteService` e `ClienteController`), por isso vão **em sequência**, na ordem das fases.
- **Polish (F8)**: depois de todas.

### Within Each User Story

- O teste vem antes e precisa **FALHAR** antes da implementação.
- A ordem é DTO, entidade, repository, service e controller.
- Um commit por fase (`tipo: descrição` em português, sem Co-Authored-By), sempre com tudo verde.

### Parallel Opportunities

- T001 e T002 rodam em paralelo.
- Na US1, os testes T008 a T011 são de arquivos distintos. O mesmo vale para os testes de cada fase seguinte marcados com [P].

## Parallel Example: User Story 1

```bash
Task: "T008 DadosCadastroClienteTest"
Task: "T009 ClienteTest"
Task: "T010 ClienteServiceTest"
Task: "T011 ClienteControllerCadastroTest"
```

## Implementation Strategy

1. F1 e F2: infra pronta, médicos intactos.
2. US1: **MVP** (dá para cadastrar cliente). Parar e validar.
3. US2 a US5: completam as 7 operações.
4. Polish: Swagger, README, verificação, review e PR.
