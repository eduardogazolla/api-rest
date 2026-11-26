# Voll.med Constitution

## Core Principles

### I. Camadas com responsabilidade única

O back-end segue Controller → Service → Repository, com pacotes organizados por domínio
(`medico/`, `endereco/`) e o que é transversal em `infra/`.

- O Controller MUST só receber a requisição e repassar ao Service, sem acessar o Repository.
- As regras de negócio MUST ficar no Service ou na entidade.
- As dependências MUST ser injetadas pelo construtor, com atributos `final`. `@Autowired` em
  atributo é proibido.
- A entrada e a saída da API MUST usar DTOs (records), nunca a entidade JPA.

Por quê: cada camada pode ser testada e trocada sem afetar as outras.

### II. Testes antes de pronto (NÃO NEGOCIÁVEL)

- Todo código novo MUST ter pelo menos um teste positivo e um de exceção. Isso vale para o
  back-end (JUnit 5, Mockito, MockMvc) e para o front-end (Vitest, Testing Library).
- Os testes MUST seguir o padrão `deve[Resultado]Quando[Condição]`, com `@DisplayName` em
  português no Java.
- Refatoração só pode acontecer com os testes verdes antes e depois.
- O `mvn test` MUST passar num clone limpo, sem MySQL e sem Node. O H2 é usado nos testes.

Por quê: este é um projeto de PDI. O teste prova que o autor entende o código.

### III. Erros explícitos e traduzidos num ponto central

- A busca por ID MUST usar `findById(...).orElseThrow(...)` com mensagem clara.
- Exceções MUST ser traduzidas para o status HTTP correto no `TratadorDeErros`:
  - recurso inexistente → 404;
  - dado inválido → 400;
  - conflito de unicidade → 409.
- Nunca pode sair um 500 por erro previsível.
- Erros de campo MUST usar o formato `[{ "campo": "...", "mensagem": "..." }]`, com mensagens
  em português.
- O front-end MUST mostrar cada erro de campo embaixo do campo correspondente e nunca pode
  engolir um erro em silêncio.

### IV. Simplicidade e código explicável

- Nada de código morto: imports, métodos ou arquivos sem uso.
- Nada de código "para o futuro".
- Nomes MUST explicar a intenção, em português, e métodos MUST começar com verbo.
- Funções MUST ser pequenas e fazer uma coisa só.
- Comentários só podem explicar o porquê.
- No front-end, as dependências se limitam a React, React Router, Vite, TypeScript e as
  bibliotecas de teste. Qualquer outra MUST ser justificada no plano.
- O autor MUST conseguir explicar cada linha.

Por quê: o objetivo é aprender. Uma biblioteca "mágica" esconde justamente o que se quer estudar.

### V. Um deploy, contrato estável

- O front-end é compilado e empacotado no mesmo `.jar` da API. A tela e a API ficam na mesma
  origem, sem CORS.
- As rotas de tela MUST NOT começar com `/medicos`, prefixo reservado à API.
- Endpoints existentes MUST NOT mudar de contrato. O que for novo é adicionado ao lado.
- O Swagger (`/swagger-ui/index.html`) e o health check (`/health`) MUST continuar funcionando.

## Restrições técnicas e de segurança

- Back-end:
  - Java 17, Spring Boot 4.1.1, Spring Data JPA, Flyway, Bean Validation e springdoc 3.1.1.
  - Bancos: MySQL local, PostgreSQL no Portal DB1 e H2 nos testes.
  - Toda migration MUST ter a versão MySQL (`db/migration`) e a PostgreSQL (`db/postgresql`).
- Front-end: React 19, TypeScript e Vite, em `frontend/`, com Node 24.
- Nenhum segredo no código. Credenciais e URLs de banco vêm de variáveis de ambiente.
- Autenticação não é responsabilidade da aplicação, porque o acesso passa pelo SSO da DB1.
  Só existem dados fictícios.
- Interface em português, acessível (labels, foco visível, `aria-describedby` nos erros) e
  responsiva.

## Fluxo de desenvolvimento

- Trabalho em branch `pdi/<tema>` e entrada na `main` só por pull request.
- Commits pequenos, no padrão `tipo: descrição` em português (`feat`, `fix`, `test`, `docs`,
  `refactor`). Cada commit deixa os testes verdes.
- Commits e PRs não levam a linha `Co-Authored-By` do Claude.
- Antes do PR: `mvn test`, `npm test` e `npm run build` passando, e revisão de código.

## Governance

- Esta constituição prevalece sobre outras práticas do projeto. O `Rules.md` é o guia detalhado
  de Clean Code e precisa estar de acordo com ela.
- Emendas são feitas por PR que atualiza este arquivo, com versão semântica:
  - MAJOR quando um princípio é removido ou redefinido;
  - MINOR quando um princípio ou seção é adicionado;
  - PATCH para ajustes de redação.
- Todo plano (`/speckit-plan`) MUST passar pelo Constitution Check. Toda revisão de PR MUST
  verificar a conformidade.
- Uma violação só é aceita se estiver justificada na seção de complexidade do plano.

**Version**: 1.0.0 | **Ratified**: 2026-11-26 | **Last Amended**: 2026-11-26
