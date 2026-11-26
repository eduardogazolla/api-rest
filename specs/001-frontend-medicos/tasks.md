---

description: "Lista de tarefas da interface web de gestão de médicos"
---

# Tasks: Interface web de gestão de médicos

**Input**: Design documents from `/specs/001-frontend-medicos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-medicos.md, quickstart.md

**Tests**: OBRIGATÓRIOS, pelo princípio II da constituição. Em cada história, o teste é escrito
primeiro, falha, e só depois vem a implementação. Os nomes seguem o padrão
`deve[Resultado]Quando[Condição]`, com `@DisplayName` em português no Java e a descrição em
português no `it(...)` do Vitest.

**Organization**: tarefas agrupadas por história de usuário, para cada uma poder ser implementada
e testada de forma independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história de usuário da spec (US1 a US5)

## Path Conventions

- Back-end: `src/main/java/med/voll/api/...` e `src/test/java/med/voll/api/...`, a partir da raiz
- Front-end: `frontend/src/...`, com os testes ao lado do arquivo (`*.test.ts(x)`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: criar o projeto do front e a configuração de build e testes.

- [X] T001 Gerar o projeto em `frontend/` com o template Vite `react-ts` (`npm create vite@latest frontend -- --template react-ts`) e remover os arquivos de exemplo: `App.css`, `assets/` e o conteúdo demo de `App.tsx`. Instalar `react-router` e, como dependências de desenvolvimento, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event` e `@testing-library/jest-dom`. Fixar as versões no `frontend/package-lock.json`. Definir `<html lang="pt-BR">` e o título "Voll.med" em `frontend/index.html`
- [X] T002 Configurar `frontend/vite.config.ts`:
  - proxy de `/medicos`, `/swagger-ui` e `/v3` para `http://localhost:8080` (research.md R9);
  - bloco `test` do Vitest com `environment: "jsdom"` e `setupFiles: "./src/test/setup.ts"`;
  - script `"test": "vitest run"` em `frontend/package.json`.
- [X] T003 [P] Criar `frontend/src/test/setup.ts`, que importa `@testing-library/jest-dom/vitest`, simula `HTMLDialogElement.prototype.showModal` e `close` (o jsdom não implementa) e restaura os mocks de `fetch` após cada teste
- [X] T004 [P] Adicionar `frontend/node_modules/`, `frontend/dist/` e `src/main/resources/static/` ao `.gitignore`. Criar `.dockerignore` com `target/`, `frontend/node_modules/`, `frontend/dist/` e `.git/`
- [X] T005 [P] Criar `frontend/src/styles/tokens.css` e `frontend/src/styles/global.css` com a direção visual de research.md R8:
  - variáveis em `:root`, com o tema escuro em `@media (prefers-color-scheme: dark)`;
  - foco visível;
  - reset mínimo;
  - fontes Fraunces e Atkinson Hyperlegible via `<link>` em `frontend/index.html`.
  - Usar a skill `frontend-design` para os detalhes.

**Checkpoint**: `cd frontend && npm test` (sem testes ainda) e `npm run build` passam.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: formato de erro da API, rotas de tela no Spring, cliente HTTP e esqueleto da SPA, que
todas as histórias usam.

**⚠️ CRITICAL**: nenhuma história começa antes desta fase.

### Testes primeiro

- [X] T006 [P] Criar `src/test/java/med/voll/api/medico/MedicoControllerValidacaoTest.java` (`@SpringBootTest`, `@AutoConfigureMockMvc`, `@ActiveProfiles("test")`, no mesmo estilo de `MedicoControllerOrdenacaoTest`) com:
  - `deveRetornar400ComErrosPorCampoQuandoCadastroForInvalido`: POST com CRM `"12"` e CEP `"abc"` espera `status 400`, `$[?(@.campo=='crm')].mensagem` igual a "deve ter de 4 a 6 dígitos" e `$[?(@.campo=='endereco.cep')]` presente;
  - `deveRetornarMensagensEmPortuguesQuandoCampoObrigatorioFaltar`: POST com `nome` vazio espera `campo=nome` e mensagem "é obrigatório".
  - Rodar `./mvnw test -Dtest=MedicoControllerValidacaoTest` e confirmar que FALHA.
- [X] T007 [P] Atualizar `src/test/java/med/voll/api/infra/HomeControllerTest.java`. Criar `src/test/java/med/voll/api/infra/RotasDaTelaTest.java` (MockMvc) com:
  - `deveEncaminharParaIndexQuandoRotaForDeTela`, parametrizado com `/`, `/inativos`, `/cadastro` e `/editar/7`, que espera `forwardedUrl("/index.html")`;
  - `deveContinuarServindoHealthQuandoRotasDeTelaExistirem`, com `GET /health` 200.
  - Confirmar que FALHA.
- [X] T008 [P] Criar `frontend/src/api/cliente.test.ts` cobrindo `requisitar`, com `fetch` simulado:
  - `deveDevolverJsonQuandoRespostaForOk`;
  - `deveDevolverUndefinedQuandoRespostaOkVierSemCorpo`;
  - `deveLancarValidacaoComCamposQuando400ForLista`;
  - `deveLancarRequisicaoComMensagemQuando400ForObjeto`;
  - `deveLancarConflitoQuando409`;
  - `deveLancarNaoEncontradoQuando404`;
  - `deveLancarRedeQuandoFetchFalhar`;
  - `deveLancarSessaoQuandoRespostaForRedirecionadaOuHtml`;
  - `deveLancarServidorQuando500`.
  - Os tipos seguem research.md R6.

### Implementação

- [X] T009 Em `src/main/java/med/voll/api/medico/DadosCadastroMedico.java` e `src/main/java/med/voll/api/endereco/DadosEndereco.java`, colocar `message` em português em cada anotação, conforme data-model.md "Mensagens explícitas" (`DadosCadastroMedico.nome`, `.email`, `.telefone`, `.crm`, `.especialidade`, `.endereco`; `DadosEndereco.logradouro`, `.bairro`, `.cep`, `.cidade`, `.uf`)
- [X] T010 Em `src/main/java/med/voll/api/infra/TratadorDeErros.java`:
  - adicionar o record `DadosErroCampo(String campo, String mensagem)` com construtor a partir de `FieldError` (data-model.md `TratadorDeErros.DadosErroCampo`);
  - adicionar o handler de `MethodArgumentNotValidException`, que responde 400 com `List<DadosErroCampo>`;
  - manter o handler de sort intacto.
  - O T006 deve passar.
- [X] T011 Reescrever `src/main/java/med/voll/api/infra/HomeController.java` para mapear `GET /`, `/inativos`, `/cadastro` e `/editar/{id:\\d+}` para `"forward:/index.html"` (research.md R2), mantendo o `@Hidden`. O T007 deve passar, e o `./mvnw test` completo também
- [X] T012 [P] Criar `frontend/src/api/tipos.ts` exatamente com os tipos de data-model.md "Front-end", e `ErroApi` em `frontend/src/api/cliente.ts`
- [X] T013 Implementar `requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T>` em `frontend/src/api/cliente.ts`:
  - envia `Accept: application/json`, e `Content-Type: application/json` quando houver corpo;
  - lê o corpo só quando houver conteúdo.
  - O T008 deve passar.
- [X] T014 [P] Criar `frontend/src/dominio/constantes.ts` com:
  - `ESPECIALIDADES`, uma lista de `{valor: Especialidade, rotulo}` para data-model.md `Especialidade` (rótulos "Ortopedia", "Cardiologia", "Ginecologia", "Dermatologia");
  - `UFS` com as 27 siglas.
- [X] T015 Criar `frontend/src/main.tsx` e `frontend/src/App.tsx`:
  - `BrowserRouter` com as rotas `/`, `/inativos`, `/cadastro`, `/editar/:id` e um fallback "Página não encontrada";
  - as rotas ainda vazias renderizam placeholders;
  - layout com `<main>` e importação dos estilos.
  - Criar também `frontend/src/components/Cabecalho.tsx` com a marca Voll.med e a navegação "Médicos ativos" e "Inativos" (`NavLink` com `aria-current`).

**Checkpoint**: `./mvnw test` e `npm test` verdes. Erros da API já saem como `[{campo, mensagem}]`.

---

## Phase 3: User Story 1 - Consultar os médicos ativos (Priority: P1) 🎯 MVP

**Goal**: lista paginada e ordenável de médicos ativos em `/`, com o estado guardado na URL.

**Independent Test**: com médicos no banco, abrir `/`, ordenar por CRM, ir à página 2 e
recarregar: o estado se mantém. Sem médicos, aparece a lista vazia (spec US1).

### Tests for User Story 1

- [X] T016 [P] [US1] Criar `frontend/src/api/medicos.test.ts`, com `deveMontarQueryDePaginaEOrdenacaoQuandoListarAtivos`: `listarAtivos({page: 1, sort: "crm,desc"})` chama `/medicos?page=1&size=10&sort=crm%2Cdesc`
- [X] T017 [P] [US1] Criar `frontend/src/components/Paginacao.test.tsx` com:
  - `deveDesabilitarAnteriorQuandoNaPrimeiraPagina`;
  - `deveChamarOnMudarComProximaPaginaQuandoClicarProxima`;
  - `deveMostrarPaginaAtualDeTotal`, que exibe o texto "Página 2 de 3".
- [X] T018 [P] [US1] Criar `frontend/src/components/TabelaMedicos.test.tsx` com:
  - `deveRenderizarUmaLinhaPorMedico`;
  - `deveMarcarAriaSortNaColunaOrdenada`;
  - `deveInverterDirecaoQuandoClicarNaColunaJaOrdenada` (`nome,asc` passa a `nome,desc`);
  - `deveRenderizarAcoesRecebidasPorLinha`.
- [X] T019 [US1] Criar `frontend/src/pages/ListaMedicos.test.tsx` (modo `ativos`), com `MemoryRouter` e `fetch` simulado:
  - `deveListarMedicosOrdenadosPorNomeQuandoAbrirSemParametros`;
  - `deveAtualizarUrlQuandoOrdenarPorCrm`;
  - `deveMostrarEstadoVazioComAtalhoParaCadastroQuandoNaoHouverMedicos`;
  - `deveMostrarLinkParaPrimeiraPaginaQuandoPaginaPassarDoFim`;
  - `deveMostrarMensagemDaApiEVoltarAoPadraoQuandoSortForInvalido`;
  - `deveMostrarErroDeConexaoQuandoRedeFalhar`, com o texto "Não foi possível falar com o servidor. Tente novamente.";
  - `deveMostrarSessaoExpiradaQuandoErroForSessao`.

### Implementation for User Story 1

- [X] T020 [US1] Implementar `listarAtivos(params: {page?: number; sort?: string}): Promise<Pagina<MedicoListagem>>` em `frontend/src/api/medicos.ts`. O T016 deve passar
- [X] T021 [P] [US1] Implementar `frontend/src/components/Paginacao.tsx`, com as props `{pagina: number; totalPaginas: number; onMudar(p: number): void}`. O T017 deve passar
- [X] T022 [P] [US1] Implementar `frontend/src/components/TabelaMedicos.tsx`:
  - props `{medicos: MedicoListagem[]; sort: string; onOrdenar(sort: string): void; acoes?(m: MedicoListagem): ReactNode}`;
  - colunas Nome, E-mail, CRM e Especialidade, com o rótulo vindo de `ESPECIALIDADES`;
  - cabeçalhos como `<button>` dentro de `<th aria-sort>`;
  - abaixo de 640px, vira cartões via CSS.
  - O T018 deve passar.
- [X] T023 [US1] Implementar `frontend/src/pages/ListaMedicos.tsx`:
  - prop `modo: "ativos" | "inativos"`, com só `ativos` ligado nesta fase;
  - `page` e `sort` via `useSearchParams`, com padrão `nome,asc`;
  - estados de carregando, vazio, erro e lista;
  - botão "Novo médico" ligado a `/cadastro`.
  - Ligar a rota `/` em `App.tsx`. O T019 deve passar.

**Checkpoint**: MVP de leitura funcionando contra a API real (`npm run dev` mais a API com H2).

---

## Phase 4: User Story 2 - Cadastrar médico (Priority: P1)

**Goal**: formulário de cadastro com validação local e erros do servidor por campo, incluindo 409 de duplicidade.

**Independent Test**: cadastrar um médico válido, que aparece na lista com o aviso. CRM `"12"` dá
erro local. CRM repetido dá erro 409 embaixo do campo (spec US2).

### Tests for User Story 2

- [X] T024 [P] [US2] Em `src/test/java/med/voll/api/medico/MedicoServiceTest.java`, adicionar:
  - `deveLancarCadastroDuplicadoQuandoCrmJaExistir`, que verifica `campo == "crm"` e `save` nunca chamado;
  - `deveLancarCadastroDuplicadoQuandoEmailJaExistir`, com `campo == "email"`;
  - `deveChecarCrmAntesDoEmailQuandoAmbosExistirem`;
  - `deveSalvarQuandoCrmEEmailForemInéditos`.
  - Confirmar que FALHA.
- [X] T025 [P] [US2] Criar `src/test/java/med/voll/api/medico/MedicoControllerDuplicidadeTest.java` (MockMvc e H2) com:
  - `deveRetornar409ComCampoCrmQuandoCadastrarCrmRepetido`: cadastra, cadastra de novo com outro e-mail, e espera `$[0].campo == "crm"` e a mensagem de research.md R4;
  - `deveRetornar409QuandoCrmPertencerAMedicoInativo`: cadastra, `DELETE`, cadastra de novo, e espera 409.
  - Criar também `src/test/java/med/voll/api/infra/TratadorDeErrosTest.java` com `deveRetornar409SemCampoQuandoHouverViolacaoDeIntegridade`, chamando o handler direto.
- [X] T026 [P] [US2] Criar `frontend/src/dominio/validacao.test.ts`, para `validarMedico(dados, "cadastro")`:
  - `deveExigirTodosOsObrigatoriosQuandoCadastroVazio`, com os campos obrigatórios de data-model.md "Regras de validação no navegador";
  - `deveRecusarCrmForaDoPadrao` (`"12"` e `"1234567"`);
  - `deveRecusarCepComTraco` (`"87000-000"`);
  - `deveRecusarEmailInvalido`;
  - `deveAceitarCadastroValidoSemNumeroEComplemento`.
- [X] T027 [P] [US2] Criar `frontend/src/components/Campo.test.tsx` com `deveLigarErroAoInputPorAriaDescribedby` e `deveMarcarAriaInvalidQuandoHouverErro`
- [X] T028 [US2] Criar `frontend/src/pages/FormularioMedico.test.tsx` (modo `cadastro`) com:
  - `naoDeveEnviarQuandoValidacaoLocalFalhar`;
  - `deveMostrarErroDoServidorNoCampoCrmEManterDadosQuandoReceber409`;
  - `deveNavegarParaListaComAvisoQuandoCadastrarComSucesso`, com o aviso "Médico cadastrado";
  - `deveDesabilitarSalvarDuranteEnvio`, garantindo que dois cliques geram 1 `fetch`;
  - `deveMostrarErroGeralQuandoConflitoNaoTiverCampo`.
- [X] T029 [P] [US2] Em `frontend/src/pages/ListaMedicos.test.tsx`, adicionar `deveMostrarAvisoRecebidoNaNavegacao`, que procura `role="status"` com o texto do aviso

### Implementation for User Story 2

- [X] T030 [US2] Adicionar `existsByEmail` e `existsByCrm` em `src/main/java/med/voll/api/medico/MedicoRepository.java` (data-model.md `MedicoRepository`). Criar `src/main/java/med/voll/api/medico/CadastroDuplicadoException.java` (data-model.md `CadastroDuplicadoException.campo`). Fazer a checagem em `MedicoService.cadastrar`, conforme research.md R4. O T024 deve passar
- [X] T031 [US2] Em `src/main/java/med/voll/api/infra/TratadorDeErros.java`, adicionar os handlers:
  - `CadastroDuplicadoException`, que responde 409 com `[DadosErroCampo(campo, mensagem)]`;
  - `DataIntegrityViolationException`, que responde 409 com `[DadosErroCampo(null, "Já existe um médico com estes dados.")]`.
  - Documentar o 409 no `@ApiResponse` do `POST` em `MedicoController`. O T025 deve passar.
- [X] T032 [P] [US2] Implementar `validarMedico(dados, modo): Record<string, string>` em `frontend/src/dominio/validacao.ts`, usando as regras de data-model.md (`MedicoCadastro.crm`, `.email`, `Endereco.cep`, `Endereco.uf`) e as mesmas mensagens do servidor. O T026 deve passar
- [X] T033 [P] [US2] Implementar `frontend/src/components/Campo.tsx`:
  - rótulo, input ou select (via `children` ou a prop `tipo`), dica e erro;
  - `id` gerado com `useId`;
  - `aria-describedby` e `aria-invalid`.
  - O T027 deve passar.
- [X] T034 [US2] Implementar `cadastrarMedico(dados: MedicoCadastro): Promise<void>` em `frontend/src/api/medicos.ts`, mais um teste em `medicos.test.ts` que verifica o método POST e o corpo JSON
- [X] T035 [US2] Implementar `frontend/src/pages/FormularioMedico.tsx` no modo `cadastro`:
  - seções "Dados do médico" e "Endereço";
  - selects de especialidade e UF vindos de `constantes.ts`;
  - validação local antes de enviar;
  - mapeia `ErroApi.campos` para os erros por campo, e um erro com `campo: null` vira mensagem geral no topo;
  - botão desabilitado durante o envio;
  - em caso de sucesso, chama `navigate("/", {state: {aviso: "Médico cadastrado"}})`.
  - Ligar a rota `/cadastro`. O T028 deve passar.
- [X] T036 [US2] Criar `frontend/src/components/Aviso.tsx` (`role="status"`, some sozinho após 5 s). Fazer a `ListaMedicos` ler `location.state.aviso` uma vez e limpar o `state` com `replace`. O T029 deve passar

**Checkpoint**: US1 e US2 completas, que é o MVP de cadastro mais a consulta.

---

## Phase 5: User Story 3 - Editar médico (Priority: P2)

**Goal**: formulário pré-preenchido via `GET /medicos/{id}`, com campos bloqueados, envio só do
que mudou e validação de endereço no servidor.

**Independent Test**: editar o telefone de um médico, salvar e reabrir. `/editar/99999` mostra
"Médico não encontrado" (spec US3).

### Tests for User Story 3

- [X] T037 [P] [US3] Em `MedicoServiceTest.java`, adicionar `deveDetalharMedicoInativoQuandoIdExistir` (garantindo `ativo == false` no DTO) e `deveLancarExcecaoAoDetalharMedicoInexistente`
- [X] T038 [P] [US3] Criar `src/test/java/med/voll/api/medico/MedicoControllerDetalhamentoTest.java` (MockMvc e H2) com:
  - `deveRetornar200ComEnderecoQuandoDetalharMedicoExistente`, que verifica `$.telefone`, `$.endereco.cep` e `$.ativo`;
  - `deveRetornar404QuandoDetalharMedicoInexistente`;
  - `deveRetornar400QuandoAtualizarComCepInvalido` (PUT com `endereco.cep = "abc"`, esperando `campo == "endereco.cep"`);
  - `deveApagarComplementoQuandoAtualizarComTextoVazio`.
- [X] T039 [P] [US3] Criar `src/test/java/med/voll/api/endereco/DadosAtualizacaoEnderecoTest.java` (Validator) com:
  - `deveAceitarTodosOsCamposNulos`;
  - `deveRecusarLogradouroEmBranco`;
  - `deveRecusarCepComMenosDeOitoDigitos`;
  - `deveAceitarComplementoVazio`.
- [X] T040 [P] [US3] Em `frontend/src/api/medicos.test.ts`, adicionar:
  - `deveBuscarDetalheQuandoDetalharMedico`;
  - `deveEnviarPutComIdQuandoAtualizar`;
  - para a função pura `calcularAlteracoes(original, atual)`:
    - `deveIncluirSoCamposAlterados`;
    - `deveEnviarTextoVazioQuandoNumeroForApagado`;
    - `deveOmitirEnderecoQuandoNadaMudar`.
- [X] T041 [US3] Em `FormularioMedico.test.tsx`, adicionar para o modo `edicao`:
  - `devePreencherFormularioComDadosAtuais`;
  - `deveBloquearEmailCrmEEspecialidadeComExplicacao`;
  - `deveEnviarSoCamposAlteradosQuandoSalvar`;
  - `deveMostrarMedicoNaoEncontradoQuando404`, com link de volta para a lista;
  - `deveRecusarNomeEmBrancoNaEdicao`.

### Implementation for User Story 3

- [X] T042 [P] [US3] Criar `src/main/java/med/voll/api/medico/DadosDetalhamentoMedico.java` (data-model.md `DadosDetalhamentoMedico`) e o construtor `DadosEndereco(Endereco endereco)` em `src/main/java/med/voll/api/endereco/DadosEndereco.java`
- [X] T043 [US3] Implementar `MedicoService.detalhar(Long id)` e `@GetMapping("/{id}")` em `MedicoController`, com `@Operation` e `@ApiResponse` 200 e 404. O T037 e os testes GET do T038 devem passar
- [X] T044 [US3] Criar `src/main/java/med/voll/api/endereco/DadosAtualizacaoEndereco.java` (data-model.md `DadosAtualizacaoEndereco.logradouro`, `.bairro`, `.cidade`, `.uf`, `.cep`, `.numero`, `.complemento`). Trocar a assinatura de `Endereco.atualizarInformacoes` e o tipo de `DadosAtualizacaoMedico.endereco` para `@Valid DadosAtualizacaoEndereco` (data-model.md `DadosAtualizacaoMedico.endereco`). Ajustar `MedicoTest` e `MedicoServiceTest` aos novos tipos, sem mudar o que eles afirmam. O T038, o T039 e o `./mvnw test` completo devem passar
- [X] T045 [US3] Implementar `detalharMedico(id)`, `atualizarMedico(dados: MedicoAtualizacao)` e `calcularAlteracoes(original: MedicoDetalhe, atual: MedicoCadastro): MedicoAtualizacao` em `frontend/src/api/medicos.ts`. O T040 deve passar
- [X] T046 [US3] Estender `frontend/src/pages/FormularioMedico.tsx` para o modo `edicao`:
  - carrega com `detalharMedico`;
  - e-mail, CRM e especialidade ficam `readOnly`/`disabled`, com a dica "Não pode ser alterado";
  - salva com `calcularAlteracoes`, e no sucesso navega com o aviso "Médico atualizado";
  - um 404 mostra "Médico não encontrado".
  - Ligar a rota `/editar/:id`. Adicionar o botão "Editar" nas ações da `ListaMedicos` (modo ativos). O T041 deve passar.

**Checkpoint**: US1, US2 e US3 funcionam de forma independente.

---

## Phase 6: User Story 4 - Excluir e reativar médico (Priority: P2)

**Goal**: excluir com confirmação e ter uma lista de inativos com o botão "Reativar".

**Independent Test**: excluir, achar em `/inativos`, reativar e ver de volta nos ativos. Excluir o
único médico da última página volta para a página anterior (spec US4).

### Tests for User Story 4

- [X] T047 [P] [US4] Em `MedicoServiceTest.java`, adicionar `deveListarSomenteInativosQuandoListarInativos` (`verify(repository).findAllByAtivoFalse(paginacao)`)
- [X] T048 [P] [US4] Criar `src/test/java/med/voll/api/medico/MedicoControllerInativosTest.java` (MockMvc e H2) com:
  - `deveListarApenasInativosQuandoChamarInativos`: cadastra 2, exclui 1, e espera `totalElements == 1` com o nome do excluído;
  - `deveRetornar400QuandoSortDeInativosForInvalido`;
  - `naoDeveConfundirInativosComIdQuandoChamarRotaLiteral`.
- [X] T049 [P] [US4] Criar `frontend/src/components/ModalConfirmacao.test.tsx` com:
  - `deveMostrarMensagemComNomeDoMedico`;
  - `deveChamarOnConfirmarQuandoConfirmar`;
  - `deveChamarOnCancelarQuandoCancelarOuEsc`.
- [X] T050 [US4] Em `ListaMedicos.test.tsx`, adicionar:
  - `deveExcluirSomenteAposConfirmacao`, em que cancelar não chama `DELETE`;
  - `deveRemoverDaListaEMostrarAvisoQuandoExcluir`;
  - `deveIrParaPaginaAnteriorQuandoExcluirUltimoDaUltimaPagina` (research.md R7);
  - para o modo inativos: `deveListarInativosComBotaoReativar` e `deveRemoverDaListaQuandoReativar`, com o aviso "Médico reativado".
- [X] T051 [P] [US4] Em `frontend/src/api/medicos.test.ts`, adicionar testes de URL e método para `listarInativos`, `excluirMedico` (DELETE `/medicos/{id}`) e `reativarMedico` (PATCH `/medicos/{id}/ativar`)

### Implementation for User Story 4

- [X] T052 [US4] Adicionar `findAllByAtivoFalse` em `MedicoRepository` (data-model.md `MedicoRepository`), `MedicoService.listarInativos` e `@GetMapping("/inativos")` em `MedicoController`. Usar `@PageableDefault(size = 10, sort = {"nome"})` e `@ParameterObject`, e documentar 200 e 400 como no `listar`. O T047 e o T048 devem passar
- [X] T053 [P] [US4] Implementar `listarInativos`, `excluirMedico` e `reativarMedico` em `frontend/src/api/medicos.ts`. O T051 deve passar
- [X] T054 [P] [US4] Implementar `frontend/src/components/ModalConfirmacao.tsx` com `<dialog>` nativo (`showModal`), título, mensagem, os botões "Cancelar" e "Excluir" (este com estilo de perigo) e o foco inicial em "Cancelar". O T049 deve passar
- [X] T055 [US4] Em `frontend/src/pages/ListaMedicos.tsx`:
  - ligar o botão "Excluir", com modal e aviso "Médico excluído";
  - ligar o modo `inativos` (título "Médicos inativos", ação "Reativar" com o aviso "Médico reativado", sem o botão "Novo médico");
  - aplicar a regra de voltar uma página.
  - Ligar a rota `/inativos`. O T050 deve passar.

**Checkpoint**: o ciclo de vida completo funciona pela interface.

---

## Phase 7: User Story 5 - Continuar usando a documentação técnica (Priority: P3)

**Goal**: o Swagger continua em `/swagger-ui/index.html`, com link no cabeçalho, e documenta os
novos endpoints.

**Independent Test**: clicar em "Documentação da API" abre o Swagger, que lista `GET /medicos/{id}`
e `GET /medicos/inativos`.

- [X] T056 [P] [US5] Em `src/test/java/med/voll/api/infra/SwaggerDocumentacaoTest.java`, adicionar `deveDocumentarEndpointsNovosQuandoGerarApiDocs`, com `$.paths['/medicos/{id}'].get` e `$.paths['/medicos/inativos'].get` existentes, e `deveManterSwaggerUiDisponivel`, com `GET /swagger-ui/index.html` 200
- [X] T057 [P] [US5] Criar `frontend/src/components/Cabecalho.test.tsx` com `deveTerLinkParaDocumentacaoDaApi` (`href="/swagger-ui/index.html"`) e `deveMarcarNavegacaoAtual`
- [X] T058 [US5] Adicionar o link "Documentação da API" em `frontend/src/components/Cabecalho.tsx`. O T056 e o T057 devem passar

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: deploy, documentação, acabamento visual e verificação de ponta a ponta.

- [X] T059 Atualizar o `Dockerfile` com a etapa `FROM node:24-alpine AS front`. Ela copia `frontend/package*.json`, roda `npm ci`, copia `frontend/` e roda `npm test && npm run build`. Na etapa Maven, copiar `--from=front /front/dist` para `src/main/resources/static` antes do `mvn package`. Validar com `docker build .` se o Docker estiver disponível; se não estiver, registrar como pendente
  - ⚠️ Resultado: Dockerfile atualizado, mas o `docker build` não foi validado porque não há Docker nesta máquina. Os passos foram reproduzidos à mão: build do front, cópia para `static/` e `spring-boot:run`.
- [X] T060 [P] Em `README.md`, adicionar a seção "Front-end" (stack, como rodar em dev, testes e build), atualizar a estrutura de diretórios, a tabela de endpoints (os dois novos e os erros 400/409) e "Funcionalidades". A rota `/` agora abre a tela, e o Swagger fica em `/swagger-ui/index.html`
- [X] T061 Fazer o acabamento visual com a skill `frontend-design`:
  - revisar a hierarquia, os estados (carregando, vazio, erro) e o contraste nos dois temas;
  - revisar os cartões em 375px.
  - Ajustar só CSS e marcação, sem mudar o comportamento testado.
- [X] T062 Rodar o roteiro de `quickstart.md` ("Roteiro de verificação manual", itens 1 a 10) com o Playwright MCP, contra o `.jar` com o front em `static/` e a API com H2. Salvar os screenshots em `evidencias/frontend/`
- [X] T063 Rodar o Lighthouse (acessibilidade) em `/` e `/cadastro` com o Chrome DevTools MCP. Corrigir violações graves (SC-006) e registrar a nota
- [X] T064 Conferir que o bundle tem < 250 kB gzip (saída do `npm run build`), que `./mvnw test`, `npm test` e `npm run build` estão verdes e que não sobrou código morto (imports e arquivos do template Vite)
- [ ] T065 Fazer a revisão de código da branch inteira (skill `code-review`, back-end e front-end) contra a constituição, e aplicar as correções procedentes
- [X] T066 Pendência manual (Eduardo): confirmar com o time do Portal DB1 se a nova tela em `/` exige atualizar o `db1app.json`. Não alterar o arquivo nesta entrega
  - Decisão do Eduardo (26/11/2026): os fatores de risco não mudam, porque não há dado exposto e a API continua atrás do SSO. Só a `descricao` do `db1app.json` foi atualizada, para mencionar a interface web.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências.
- **Foundational (Fase 2)**: depende da Fase 1 e bloqueia todas as histórias.
- **US1 (Fase 3)**: depende da Fase 2.
- **US2 (Fase 4)**: depende da Fase 2. Usa a `ListaMedicos` (US1) só para mostrar o aviso (T029/T036).
- **US3 (Fase 5)**: depende da Fase 2 e reutiliza o `FormularioMedico` e o `Campo` da US2.
- **US4 (Fase 6)**: depende da Fase 2 e estende a `ListaMedicos` da US1.
- **US5 (Fase 7)**: depende da Fase 2 (Cabecalho) e da US3/US4 para o teste do Swagger ter as rotas novas.
- **Polish (Fase 8)**: depende de todas as histórias.

### Within Each User Story

- O teste vem antes e precisa FALHAR antes da implementação.
- No back-end: Repository, depois Service, depois Controller e Tratador.
- No front-end: api, depois componentes, depois páginas.
- Commit ao fim de cada tarefa ou grupo lógico, com os testes verdes (`tipo: descrição` em português, sem Co-Authored-By).

### Parallel Opportunities

- Fase 1: T003, T004 e T005 em paralelo depois do T001 e T002.
- Fase 2: os testes T006, T007 e T008 em paralelo. T012 e T014 em paralelo.
- Back-end e front-end de uma mesma história são independentes até a integração. Por exemplo,
  na US2, T024/T025 (Java) e T026/T027 (TS) podem andar juntos.

---

## Parallel Example: User Story 2

```bash
# Testes em paralelo (arquivos distintos):
Task: "T024 MedicoServiceTest: duplicidade de CRM e e-mail"
Task: "T025 MedicoControllerDuplicidadeTest: 409 com campo"
Task: "T026 validacao.test.ts: regras locais"
Task: "T027 Campo.test.tsx: aria-describedby"

# Implementações independentes:
Task: "T032 validacao.ts"
Task: "T033 Campo.tsx"
```

---

## Implementation Strategy

### MVP First

1. Fase 1 e Fase 2.
2. US1 (consulta) e US2 (cadastro): **parar e validar** com a API local.
3. Fazer a demo para o mentor.

### Incremental Delivery

1. Setup e Foundational: base pronta.
2. US1 e US2: MVP.
3. US3 (edição) e US4 (exclusão e reativação): ciclo completo.
4. US5 e Polish: documentação, Docker, acabamento e verificação E2E.

---

## Notes

- `[P]` = arquivos diferentes, sem dependência pendente.
- Cada história é verificável sozinha pelo "Independent Test".
- Evitar: tarefas vagas, dois `[P]` no mesmo arquivo e dependência entre histórias que quebre a independência.
