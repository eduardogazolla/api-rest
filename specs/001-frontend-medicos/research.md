# Research: Interface web de gestão de médicos

Cada item segue o formato Decisão / Motivo / Alternativas.

## R1. Onde o front roda e como chega ao portal

- **Decisão**: o Vite compila para `frontend/dist`. O Dockerfile tem uma etapa `node:24` que
  roda `npm ci && npm test && npm run build`, e a etapa Maven copia o `dist/` para
  `src/main/resources/static/` antes do `mvn package`.
- **Motivo**:
  - é um deploy só, na mesma origem, sem CORS;
  - o `mvn test` continua sem Node (constituição II);
  - um teste quebrado do front barra o build da imagem.
- **Alternativas**:
  - `frontend-maven-plugin`: obrigaria o `mvn test` a baixar Node;
  - dois deploys: exigiria CORS e um segundo app no portal.

## R2. Rotas de tela no Spring

- **Decisão**: o `HomeController` mapeia `GET /`, `/inativos`, `/cadastro` e
  `/editar/{id:\d+}` para `forward:/index.html`.
- **Motivo**: F5 e link direto precisam devolver a SPA. As rotas de tela ficam fora de
  `/medicos`, então não há colisão com a API.
- **Alternativas**:
  - `HashRouter` (`/#/cadastro`): URLs feias, e o Eduardo não aprenderia o fallback;
  - catch-all `/**`: engoliria 404 reais de recursos estáticos.
- **Observação**: sem o front compilado em `static/`, o forward resulta em 404. Isso é esperado
  em `mvn spring-boot:run` puro. Para desenvolver o front, usa-se o Vite (ver quickstart).

## R3. Formato e idioma dos erros

- **Decisão**: o 400 de validação e o 409 de duplicidade devolvem
  `[{ "campo": "endereco.cep", "mensagem": "deve ter 8 dígitos" }]`.
  - O `campo` vem de `FieldError.getField()`, que já sai no caminho aninhado.
  - As mensagens ficam explícitas em português no atributo `message` de cada anotação dos
    DTOs.
  - O 400 de sort inválido mantém o formato atual `{mensagem}`.
- **Motivo**: a mensagem padrão do Bean Validation depende do locale da requisição ou da JVM e
  poderia sair em inglês no portal. Mudar o formato do erro de sort quebraria um contrato que
  já existe.
- **Alternativas**:
  - `ValidationMessages.properties`: mais indireção para poucas mensagens;
  - `ProblemDetail` (RFC 9457): é o padrão, mas é mais complexo de ler no PDI. Fica como evolução.

## R4. Duplicidade de e-mail e CRM

- **Decisão**:
  - `MedicoService.cadastrar` chama `existsByCrm` e `existsByEmail` antes do `save`. Se algum
    existir, lança `CadastroDuplicadoException(campo, mensagem)`, e o tratador responde 409.
  - Como rede de segurança para a corrida entre a checagem e o insert,
    `DataIntegrityViolationException` responde 409 com `[{campo: null, mensagem: "Já existe um
    médico com estes dados."}]`.
- **Motivo**: o erro precisa apontar o campo (FR-006), e nunca pode sair um 500 previsível
  (constituição III). A checagem inclui inativos, porque a constraint do banco também inclui.
- **Alternativas**: só tratar `DataIntegrityViolationException`. O nome da constraint muda entre
  MySQL, PostgreSQL e H2, então não daria para saber o campo de forma confiável.
- **Mensagens**:
  - CRM: "Já existe um médico com este CRM (ele pode estar inativo)."
  - E-mail: "Já existe um médico com este e-mail (ele pode estar inativo)."
- **Ordem**: o CRM é checado primeiro. Só um erro é devolvido por vez, o que é aceitável.

## R5. Validação do endereço na edição

- **Decisão**: o novo `DadosAtualizacaoEndereco` aceita `null` em todos os campos.
  - `logradouro`, `bairro`, `cidade` e `uf` usam `@Pattern(".*\\S.*")`: se vierem, não podem
    estar em branco.
  - `cep` usa `@Pattern("\\d{8}")`.
  - `numero` e `complemento` são livres. `""` apaga.
  - `DadosAtualizacaoMedico.endereco` ganha `@Valid`.
- **Motivo**: dá validação de formato sem perder a atualização parcial. O JSON aceito continua
  igual.
- **Alternativas**: `@Valid` no `DadosEndereco`, que forçaria `@NotBlank` em todos os campos e
  quebraria a atualização parcial.

## R6. Cliente HTTP e sessão expirada

- **Decisão**: `requisitar<T>(caminho, opcoes)` sobre `fetch`. Ele lança `ErroApi` com `tipo`
  conforme a situação:

  | Situação | `tipo` |
  |---|---|
  | 400 com lista | `validacao` |
  | 400 com `{mensagem}` | `requisicao` |
  | 409 | `conflito` |
  | 404 | `nao-encontrado` |
  | `TypeError` do fetch | `rede` |
  | `response.redirected`, ou `content-type` com `text/html` | `sessao` |
  | outro status ≥ 500 | `servidor` |

- **Motivo**: o SSO do portal responde com redirecionamento e HTML, não com JSON. Os tipos
  explícitos deixam cada tela decidir a mensagem.
- **Alternativas**:
  - axios: dependência extra para pouco ganho (constituição IV);
  - TanStack Query: cache desnecessário nesta escala.

## R7. Estado da lista na URL e aviso pós-ação

- **Decisão**:
  - `page` e `sort` ficam em `useSearchParams` (por exemplo, `?page=1&sort=crm,desc`).
  - O aviso de sucesso vai por `navigate("/", { state: { aviso } })` e é lido uma vez na lista.
  - A exclusão e a reativação, que acontecem na própria lista, usam estado local.
  - Se a página ficar vazia, com `page > 0` e `totalPages > 0`, a lista navega para a página
    `totalPages - 1` (US4, cenário 4).
- **Motivo**: F5 mantém o contexto (FR-002), sem Context nem biblioteca de estado.

## R8. Visual e acessibilidade

- **Decisão**: direção "clínica calma". Detalhes:
  - tokens CSS em `:root`: azul-petróleo `#0f5e6b` como cor principal, cinzas quentes, raio de
    10px, espaçamento em múltiplos de 4;
  - fontes do Google Fonts: "Fraunces" para títulos e "Atkinson Hyperlegible" para o texto
    (criada para legibilidade);
  - tema escuro por `prefers-color-scheme`;
  - modal com `<dialog>` nativo (`showModal()`), que já prende o foco e fecha com Esc;
  - erros ligados ao campo por `aria-describedby` e `aria-invalid`;
  - aviso com `role="status"`;
  - em telas < 640px, a tabela vira cartões.
- **Motivo**: é legível e acessível sem biblioteca. O `<dialog>` nativo evita reimplementar a
  armadilha de foco.
- **Alternativas**: Tailwind ou um UI kit, que contrariam a constituição IV.

## R9. Desenvolvimento local e verificação E2E

- **Decisão**:
  - o `vite.config.ts` faz proxy de `/medicos`, `/swagger-ui` e `/v3` para `http://localhost:8080`;
  - para rodar a API sem MySQL:
    `./mvnw spring-boot:run -Dspring-boot.run.profiles=test -Dspring-boot.run.useTestClasspath=true`,
    que usa H2 em memória com as mesmas migrations;
  - a verificação final é feita com Playwright e Lighthouse (acessibilidade) sobre o `.jar`
    empacotado com o front.
- **Motivo**: reproduz o ambiente de produção (mesma origem) sem depender de banco instalado.
