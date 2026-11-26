---

description: "Lista de tarefas das telas de clientes"
---

# Tasks: Telas de clientes

**Input**: Design documents from `/specs/003-clientes-frontend/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rotas-de-tela.md, quickstart.md

**Tests**: OBRIGATÓRIOS (constituição, princípio II). Em cada tarefa, o teste é escrito ou ajustado primeiro, falha, e
só depois vem a implementação. Na refatoração (Fase 2), a regra é que os testes de médicos continuem verdes,
mudando apenas as rotas.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

Front em `frontend/src/...`, com os testes ao lado (`*.test.ts(x)`). Back em `src/main/java/...` e `src/test/java/...`.

---

## Phase 1: Setup

- [X] T001 Emendar `.specify/memory/constitution.md` para a 1.0.1:
  - no princípio V, "As rotas de tela MUST NOT começar com `/medicos`, prefixo reservado à API" passa a ser
    "As rotas de tela MUST ficar sob `/app`; `/medicos` e `/clientes` são reservados à API";
  - atualizar a linha de versão e a data da emenda.
- [X] T002 [P] Adicionar `'/clientes': api` ao proxy de `frontend/vite.config.ts`
- [X] T003 Em `src/test/java/med/voll/api/infra/RotasDaTelaTest.java`:
  - trocar as rotas parametrizadas por `/`, `/app`, `/app/medicos`, `/app/medicos/inativos`, `/app/clientes/cadastro` e `/app/clientes/editar/7`;
  - adicionar `naoDeveEncaminharRotasAntigasDeTela`, que espera 404 em `/inativos`.
  - Confirmar que FALHA.
- [X] T004 Mapear `{"/", "/app", "/app/**"}` em `src/main/java/med/voll/api/infra/HomeController.java` (research.md R6). O T003 e o `./mvnw test` completo devem passar

---

## Phase 2: Foundational (refatorar médicos em peças genéricas, nas rotas `/app`)

**⚠️ Ao fim desta fase, as telas de médico funcionam como antes, em `/app/medicos/...`, e nada de cliente existe ainda.**

- [ ] T005 Criar `frontend/src/api/recurso.ts` com `criarApiDeCadastro<L, D, C>(base)`. Ela devolve `listarAtivos`, `listarInativos`, `detalhar`, `cadastrar`, `atualizar`, `excluir` e `reativar`.
  - Migrar `frontend/src/api/medicos.test.ts` para testar `criarApiDeCadastro('/medicos')`, com as mesmas URLs e métodos de hoje.
  - `frontend/src/api/medicos.ts` passa a exportar `apiMedicos`.
  - Os testes devem passar.
- [ ] T006 Criar `frontend/src/dominio/alteracoes.ts` com o `calcularAlteracoes` genérico (data-model.md "Alterações para o PUT"), movendo os testes de `calcularAlteracoes` para `alteracoes.test.ts`. Em `frontend/src/dominio/validacao.ts`:
  - extrair `validarEndereco(endereco, modo)`;
  - renomear o tipo para `DadosFormularioMedico`;
  - exportar `EnderecoFormulario`.
  - Os testes de validação devem continuar verdes.
- [ ] T007 Criar `frontend/src/components/Tabela.tsx` e `Tabela.test.tsx`, migrando os 4 testes de `TabelaMedicos.test.tsx` para colunas de médico (research.md R2). Definir as colunas de médico em `frontend/src/dominio/recursos.ts`. Apagar `TabelaMedicos.tsx` e o teste dele
- [ ] T008 Em `frontend/src/api/cliente.ts`, mudar o 404 para "Não encontrado." e ajustar o `cliente.test.ts` (research.md R7)
- [ ] T009 Criar `frontend/src/pages/ListaCadastros.tsx` (research.md R1), com a área `MEDICOS` em `dominio/recursos.ts`:
  - migrar `ListaMedicos.test.tsx` para `ListaCadastros.test.tsx`, usando `MEDICOS` e as rotas `/app/medicos/...`;
  - um erro `nao-encontrado` numa ação mostra "Médico não encontrado.";
  - apagar `ListaMedicos.tsx`.
  - Todos os cenários atuais devem continuar verdes.
- [ ] T010 Criar `frontend/src/hooks/useFormularioCadastro.ts` (research.md R3) e `frontend/src/components/CamposEndereco.tsx`. Reescrever `FormularioMedico.tsx` usando os dois, com as rotas `/app/medicos`. Ajustar `FormularioMedico.test.tsx` só nas rotas. Todos os cenários devem continuar verdes
- [ ] T011 Em `frontend/src/App.tsx`, trocar as rotas para `/app/medicos`, `/app/medicos/inativos`, `/app/medicos/cadastro` e `/app/medicos/editar/:id`, e fazer `/` e `/app` redirecionarem para `/app/medicos` (contracts/rotas-de-tela.md). Conferir com `npm test` e `npm run build`

**Checkpoint**: médicos completos em `/app/medicos`, e o comportamento de antes está garantido pelos testes.

---

## Phase 3: User Story 1 - Navegar entre médicos e clientes (P1)

**Independent Test**: os cenários US1 da spec.

- [ ] T012 [P] [US1] Atualizar `frontend/src/components/Cabecalho.test.tsx`:
  - `deveMostrarAreasMedicosEClientes`;
  - `deveMarcarMedicosComoAtualTambemNoCadastro`, em `/app/medicos/cadastro` com `aria-current`;
  - `deveMarcarClientesQuandoEstiverNaAreaDeClientes`;
  - manter o link da documentação.
- [ ] T013 [P] [US1] Criar `frontend/src/components/SeletorSituacao.test.tsx`:
  - `deveMarcarAtivosNaListaPrincipal`;
  - `deveMarcarInativosNaRotaDeInativos`;
  - `deveApontarParaAsRotasDaArea`, com `/app/clientes` e `/app/clientes/inativos`.
- [ ] T014 [P] [US1] Criar `frontend/src/App.test.tsx` com `deveRedirecionarRaizParaMedicos` e `deveMostrarPaginaNaoEncontradaEmRotaAntiga` (`/inativos`)
- [ ] T015 [US1] Implementar:
  - `Cabecalho.tsx`, com Médicos e Clientes sem o link Inativos;
  - `SeletorSituacao.tsx`, um `nav` com `aria-label="Situação"` e `NavLink end`;
  - o seletor dentro da `ListaCadastros`, abaixo do título, que passa a ser "Médicos"/"Clientes" com o resumo.
  - Os estilos do seletor ficam em `global.css`, com os tokens atuais.
  - T012 a T014 devem passar, e os testes da Fase 2 também, com o título ajustado.

---

## Phase 4: User Story 2 - Consultar clientes ativos (P1)

**Independent Test**: os cenários US2 da spec.

- [ ] T016 [P] [US2] Criar `frontend/src/dominio/cpf.test.ts`:
  - `deveFormatarCpfCompleto` (`52998224725` vira `529.982.247-25`);
  - `deveFormatarCpfParcialEnquantoDigita` (`5299` vira `529.9`, `529982247` vira `529.982.247`);
  - `deveGuardarSoDigitosAteOnze`;
  - `deveAceitarCpfComDigitosValidos`;
  - `deveRecusarDigitoVerificadorErrado` (`52998224724`);
  - `deveRecusarOnzeDigitosIguais`.
- [ ] T017 [US2] Implementar `frontend/src/dominio/cpf.ts` (research.md R4). O T016 deve passar
- [ ] T018 [US2] Em `frontend/src/api/tipos.ts`, adicionar os tipos de cliente (data-model.md "Tipos da API"). Criar `frontend/src/api/clientes.ts` com `apiClientes = criarApiDeCadastro('/clientes')` e um teste de URL. Criar a área `CLIENTES` em `dominio/recursos.ts`, com as colunas Nome, E-mail e CPF, sendo o CPF formatado
- [ ] T019 [US2] Em `ListaCadastros.test.tsx`, adicionar um bloco de clientes:
  - `deveListarClientesComCpfFormatado`;
  - `deveMostrarEstadoVazioDeClientesComAtalho` ("Nenhum cliente ativo", link para `/app/clientes/cadastro`);
  - `deveOrdenarClientesPorCpf`.
  - Confirmar que FALHA, ligar as rotas `/app/clientes` e `/app/clientes/inativos` em `App.tsx` e chegar ao verde.

---

## Phase 5: User Story 3 - Cadastrar cliente (P1)

**Independent Test**: os cenários US3 da spec.

- [ ] T020 [P] [US3] Em `frontend/src/dominio/validacao.test.ts`, adicionar para `validarCliente(dados, "cadastro")`:
  - `deveExigirCpfEDataDeNascimento`;
  - `deveRecusarCpfIncompleto`;
  - `deveRecusarCpfComDigitoErrado` ("CPF inválido");
  - `deveRecusarDataDeNascimentoHojeOuFutura`;
  - `deveAceitarClienteValido`.
  - Os campos estão em data-model.md (`DadosFormularioCliente.cpf` e `DadosFormularioCliente.dataNascimento`).
- [ ] T021 [P] [US3] Criar `frontend/src/pages/FormularioCliente.test.tsx` (modo cadastro):
  - `deveMostrarCpfComMascaraQuandoColar` (colar `529.982.247-25` e ver o mesmo valor);
  - `naoDeveEnviarQuandoCpfForInvalido`;
  - `deveRecusarDataFutura`;
  - `deveMostrarErroDoServidorNoCampoCpfQuandoReceber409`;
  - `deveEnviarSoDigitosDoCpfENavegarComAviso` (corpo com `cpf: "52998224725"`, depois "Cliente cadastrado" em `/app/clientes`);
  - `deveDesabilitarSalvarDuranteEnvio`.
- [ ] T022 [US3] Implementar `validarCliente` em `dominio/validacao.ts` e `frontend/src/pages/FormularioCliente.tsx`, com "Dados do cliente" (o CPF com máscara e `<input type="date" max={ontem}>`) e `CamposEndereco`. Ligar a rota `/app/clientes/cadastro`. T020 e T021 devem passar

---

## Phase 6: User Story 4 - Editar cliente (P2)

- [ ] T023 [US4] Em `FormularioCliente.test.tsx`, adicionar para o modo edição:
  - `devePreencherComCpfFormatadoEDataDeNascimento`;
  - `deveBloquearEmailCpfENascimentoComExplicacao`;
  - `deveEnviarSoOQueMudouQuandoSalvar` (`{id, telefone}`);
  - `deveMostrarClienteNaoEncontradoQuando404`;
  - `deveMostrarNaoEncontradoSemChamarApiQuandoIdNaoForNumero`.
  - Confirmar que FALHA.
- [ ] T024 [US4] Completar a edição em `FormularioCliente.tsx` (readOnly/disabled nos três campos, com a dica "Não pode ser alterado"), ligar a rota `/app/clientes/editar/:id` e o botão Editar da área `CLIENTES`. O T023 deve passar

---

## Phase 7: User Story 5 - Excluir e reativar cliente (P2)

- [ ] T025 [US5] Em `ListaCadastros.test.tsx` (bloco de clientes), adicionar:
  - `deveExcluirClienteAposConfirmacaoComAviso` ("Excluir cliente?", depois "Cliente excluído");
  - `deveReativarClienteNosInativos` ("Cliente reativado");
  - `deveMostrarClienteNaoEncontradoQuandoAcaoDer404`.
  - Ajustar a configuração `CLIENTES` até ficar verde.

**Checkpoint**: as 7 operações de clientes funcionam pela tela (SC-001).

---

## Phase 8: Polish

- [ ] T026 Fazer o acabamento visual com a skill `frontend-design`: o seletor Ativos/Inativos nos dois temas, a máscara do CPF, o seletor de data e os cartões em 375px. Só CSS e marcação
- [ ] T027 [P] Atualizar o `README.md`: a tabela de telas (rotas `/app`), a seção de clientes na interface, os testes do front e a estrutura (`hooks/`, `Tabela`, `ListaCadastros`)
- [ ] T028 Rodar `./mvnw test`, `npm test` e `npm run build` (bundle < 250 kB gzip) e conferir que não sobraram imports nem arquivos sem uso
- [ ] T029 Rodar o roteiro de quickstart.md com o Playwright contra o `.jar` no banco `vollmed_e2e` (nunca `vollmed_api`), mais o Lighthouse (acessibilidade) em `/app/clientes` e `/app/clientes/cadastro`
- [ ] T030 Fazer a revisão de código da branch (`/code-review high`) e aplicar o que for procedente
- [ ] T031 Fazer push e abrir o PR para a `main`, **sem atribuição do Claude**

---

## Dependencies & Execution Order

- **F1** e **F2** são sequenciais e bloqueiam tudo. A F2 mexe nos mesmos arquivos de médico.
- **US1 (F3)** depende da F2. **US2 a US5** dependem da US1, porque usam o seletor e o cabeçalho, e seguem em sequência, já que compartilham `ListaCadastros`, `recursos.ts` e `App.tsx`.
- **Polish** vem por último.
- Um commit por fase, com tudo verde, mensagem em português e sem Co-Authored-By.

## Implementation Strategy

1. F1 e F2: médicos idênticos, em `/app`. É o ponto mais arriscado, e por isso vem primeiro, protegido pelos testes atuais.
2. US1 e US2: **MVP**, com a área de clientes navegável e listando.
3. US3 a US5: cadastro, edição e ciclo de vida.
4. Polish: visual, README, verificação de ponta a ponta, review e PR.
