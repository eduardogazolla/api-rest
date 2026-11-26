# Front-end da Voll.med: design

Data: 26/11/2026 · Branch: `pdi/frontend`

## 1. Intenção e porquê

O Eduardo quer uma interface web para a Voll.med API, para gerenciar médicos pelo navegador em vez de usar o Swagger.

O objetivo principal é **aprender**: é uma etapa do PDI. Por isso o projeto deve:
- usar uma stack de front que o mercado usa;
- deixar visível a separação entre front e API;
- seguir as mesmas regras do back-end (`Rules.md`), incluindo testes para todo código novo.

O back-end pode ser ajustado para atender o front.

## 2. Objetivos, não-objetivos e anti-objetivos

**Objetivos**
- Listar médicos ativos, com paginação e ordenação pelas colunas.
- Listar médicos inativos e reativá-los com um clique.
- Cadastrar médico, mostrando os erros de validação no campo certo.
- Editar médico com o formulário já preenchido com os dados atuais.
- Excluir médico (exclusão lógica), pedindo confirmação antes.
- Ter um único deploy no Portal DB1: o mesmo `.jar` serve a tela em `/` e a API.

**Não-objetivos**
- Login, cadastro de usuário e autenticação na aplicação. O acesso ao site no portal já passa pelo SSO da DB1. A "tela de cadastro" é só para cadastrar médicos.
- Remover o Swagger: ele continua em `/swagger-ui/index.html`, lado a lado com o front.
- Pacientes e consultas, porque a API ainda não tem esses domínios.
- Internacionalização: tudo fica em português.
- Busca textual por nome.

**Anti-objetivos (seria um fracasso mesmo funcionando)**
- Código de front que o Eduardo não consegue explicar. É preferível pouca dependência e código legível a "mágica" de biblioteca.
- Tela com cara de template genérico.
- Quebrar o Swagger, o `/health` ou o deploy atual.
- Fazer o `mvn test` passar a exigir Node instalado.

## 3. Restrições

- Back-end: Java 17, Spring Boot 4.1.1, springdoc 3.1.1, MySQL local, PostgreSQL no portal e H2 nos testes.
- Deploy pelo `Dockerfile` no Portal DB1, atrás de proxy HTTPS (`server.forward-headers-strategy=framework`), com health check em `/health`.
- O `Rules.md` vale para o Java: camadas Controller → Service → Repository, injeção pelo construtor, sem código morto, erros tratados no `TratadorDeErros`, testes com o padrão `deve[Resultado]Quando[Condição]`.
- Ambiente local: Node 24 e npm 12.
- `POST /medicos` hoje devolve `200` sem corpo e sem ID. Isso continua igual: depois de cadastrar, o front volta para a lista.
- `PUT /medicos` só altera nome, telefone e endereço. E-mail, CRM e especialidade não podem ser editados.

## 4. Abordagens consideradas

| Abordagem | Prós | Contras |
|---|---|---|
| **A) React + TypeScript (Vite) em `frontend/`, empacotado no `.jar`** ✅ escolhida | Stack mais pedida no mercado; ensina componentes, estado, HTTP e build; mesma origem, então não precisa de CORS; um único deploy | Node e npm no projeto; uma etapa a mais no Dockerfile |
| B) HTML, CSS e JS puro em `static/` | Sem build e sem dependências | Ensina pouco de front moderno e fica bagunçado quando cresce |
| C) Thymeleaf | Tudo em Java | Não consome a própria API REST; modelo saindo de uso |

O Eduardo escolheu a **A**.

## 5. Ajustes no back-end

Cada ajuste vem com teste positivo e de exceção (regra 10).

1. **`GET /medicos/{id}`** devolve o novo record `DadosDetalhamentoMedico`, com id, nome, e-mail, telefone, CRM, especialidade, endereço completo e `ativo`.
   - Retorna 404 se o médico não existir (reusa o `buscarMedicoPorId`).
   - Traz médicos inativos também.
2. **`GET /medicos/inativos`** lista médicos inativos com a mesma paginação e ordenação de `GET /medicos` (padrão `nome`, 10 por página).
   - Usa o novo `findAllByAtivoFalse` no repositório.
   - Sort inválido retorna 400, pelo tratador que já existe.
3. **Erros de validação legíveis.** O `TratadorDeErros` passa a tratar `MethodArgumentNotValidException` e devolve 400 com uma lista `[{ "campo": "endereco.cep", "mensagem": "..." }]`.
   - As mensagens ficam em português, definidas nas anotações ou num `ValidationMessages.properties`. Assim elas não dependem do idioma da JVM do portal.
   - Hoje o Spring devolve um corpo genérico, sem dizer qual campo falhou.
4. **E-mail ou CRM duplicado.** As colunas `email` e `crm` são `unique` no banco. Hoje um cadastro duplicado vira erro 500, e isso inclui médicos inativos, porque a exclusão é lógica.
   - O Service verifica antes de salvar, com `existsByEmail` e `existsByCrm` no repositório.
   - Se já existir, lança uma exceção de negócio. O `TratadorDeErros` traduz essa exceção para **409** com o mesmo formato `[{campo, mensagem}]`, por exemplo "Já existe um médico com este CRM (pode estar inativo)".
   - O front mostra a mensagem embaixo do campo.
5. **Validação do endereço na edição.** Hoje o `PUT` não valida o endereço: um CEP `"abc"` é salvo.
   - É criado o `DadosAtualizacaoEndereco`, que tem só regras de formato:
     - CEP com 8 dígitos;
     - logradouro, bairro, cidade e UF não podem ficar em branco;
     - os campos ausentes continuam sem ser alterados.
   - O `DadosAtualizacaoMedico` passa a usar o novo DTO com `@Valid`.
   - Limitação mantida: complemento e número podem ser apagados só como texto vazio (`""`), porque `null` significa "não alterar". O front envia `""` quando o usuário limpa esses campos.
6. **Rotas do front.**
   - `HomeController` deixa de redirecionar `/` para o Swagger. O `index.html` do front é servido em `/`.
   - Um controller encaminha as rotas do front (`/inativos`, `/cadastro`, `/editar/{id}`) para o `index.html`, para que F5 e links diretos funcionem.
   - Nenhuma rota de tela começa com `/medicos`, que fica só para a API. Assim não há colisão e o proxy do Vite fica trivial.
   - O Swagger continua em `/swagger-ui/index.html`, e a tela ganha um link para ele.
   - O `HomeControllerTest` é atualizado.
7. **Swagger:** os endpoints novos são documentados como os atuais (`@Operation`, `@ApiResponse`, exemplos).

## 6. Front-end

### Estrutura

```
frontend/
  package.json, vite.config.ts, tsconfig.json, index.html
  src/
    api/          cliente HTTP (fetch) e tipos que espelham os DTOs Java
    components/   peças reutilizáveis: Tabela, Paginacao, Campo, Modal de confirmação, Aviso (toast)
    pages/        ListaMedicos, MedicosInativos, FormularioMedico (cadastro e edição)
    App.tsx       rotas e layout
    styles/       CSS com variáveis (tokens de cor, espaçamento, tipografia)
```

### Bibliotecas

- React 19, TypeScript e Vite.
- React Router para as rotas.
- Vitest e Testing Library para os testes.
- **Mais nada**: sem UI kit, sem React Query, sem biblioteca de formulário. Cada linha deve ser explicável (anti-objetivo 1).
- O cliente HTTP é um módulo pequeno sobre `fetch` que:
  - trata 400 e 409 (erros por campo), 404 e falha de rede;
  - trata a resposta que não é JSON (por exemplo, quando a sessão de login do portal expira e chega um HTML ou redirecionamento). Nesse caso mostra "Sua sessão expirou. Recarregue a página.";
  - devolve erros tipados para as telas.

### Telas

1. **Médicos ativos** (`/`)
   - Tabela com nome, e-mail, CRM e especialidade.
   - Ordenação clicando no cabeçalho, refletida na URL (`?page=0&sort=nome,asc`) para que F5 mantenha a página.
   - Paginação.
   - Botões "Editar" e "Excluir" (com modal de confirmação) em cada linha.
   - Botão "Novo médico".
   - Quando não há médicos, mostra um estado vazio com chamada para cadastrar.
2. **Médicos inativos** (`/inativos`): mesma tabela, com o botão "Reativar" em cada linha.
3. **Cadastro** (`/cadastro`)
   - Formulário com dados pessoais e endereço.
   - Especialidade num select com as 4 opções do enum.
   - UF num select com os 27 estados.
   - Validação no navegador (obrigatórios, e-mail, CRM de 4 a 6 dígitos, CEP de 8 dígitos), além da validação do servidor. O erro do servidor aparece embaixo do campo.
   - Após sucesso, volta para a lista e mostra um aviso.
4. **Edição** (`/editar/:id`)
   - Carrega os dados por `GET /medicos/{id}`.
   - E-mail, CRM e especialidade aparecem bloqueados, com uma explicação de que não podem ser alterados.
   - Envia só os campos que mudaram.
   - Se o médico não existir (404), mostra a mensagem "Médico não encontrado".
5. Topo da página com a marca Voll.med, a navegação Ativos / Inativos e um link para a documentação (Swagger).

### Visual

Direção: **clínica calma e confiável**.
- Fundo claro, um azul-petróleo como cor principal, cinzas quentes e tipografia legível (Google Fonts).
- Tem tema escuro, que segue o sistema.
- Responsivo: no celular, a tabela vira lista de cartões.
- Acessibilidade: labels nos campos, foco visível, erros associados ao campo por `aria-describedby` e modal com foco preso.
- Os detalhes ficam com quem implementa, guiado pela skill `frontend-design`.

### Testes do front

- Vitest e Testing Library, mockando o `fetch`. No mínimo:
  - cliente HTTP: sucesso, 400 e 409 com erros por campo, 404, falha de rede e resposta que não é JSON;
  - lista: renderiza linhas, paginação, ordenação e exclusão com confirmação;
  - formulário: validação local, erro do servidor no campo, edição pré-preenchida e campos bloqueados.
- Verificação manual com Playwright no navegador, rodando contra a API local.

## 7. Build e deploy

- **Desenvolvimento:**
  - `npm run dev` em `frontend/` (porta 5173) com proxy no `vite.config.ts`: `/medicos` vai para `localhost:8080`.
  - A API roda pelo IntelliJ como hoje.
  - Não precisa de CORS.
- **Produção (Dockerfile):** ganha uma etapa `node:24` antes do Maven.
  - Essa etapa roda `npm ci && npm test && npm run build`.
  - O `dist/` é copiado para `src/main/resources/static/` antes do `mvn package`.
  - O `mvn test` local continua sem precisar de Node, porque o build do front não entra no `pom.xml`.
- O `frontend/node_modules` e o `frontend/dist` vão para o `.gitignore`. O front compilado não é versionado.
- O `db1app.json` não muda. Fica como tarefa do plano confirmar com o time do Portal DB1 se a nova tela em `/` exige atualizar a declaração.
- O README ganha uma seção sobre o front: como rodar e como gerar o build.

## 8. O que ficou como decisão minha (Claude), para o Eduardo revisar

- Erros de validação no formato `[{campo, mensagem}]` com mensagens em português.
- Rotas de tela fora do prefixo `/medicos` (`/`, `/inativos`, `/cadastro`, `/editar/:id`).
- Endpoint `GET /medicos/inativos` separado, em vez de um filtro `?ativo=false` em `GET /medicos`, para não mudar o contrato atual.
- Build do front no Dockerfile, e não no `frontend-maven-plugin`, para o `mvn test` não depender de Node.
- Sem bibliotecas além de React Router e das de teste.
- Visual "clínica calma" em azul-petróleo, com tema escuro.
- E-mail ou CRM duplicado retorna 409 com o erro no campo, verificado no Service antes de salvar.
- DTO novo para validar só o formato do endereço na edição. Complemento e número são apagados com `""`.
- Resposta que não é JSON é tratada como sessão expirada.
- O formato de erro do sort inválido (`{mensagem}`) continua como está. O front mostra essa mensagem como aviso geral.

## 9. Fica com quem implementa

- Nomes exatos de componentes e arquivos do front, seguindo os nomes em português do projeto.
- Paleta e fontes exatas.
- Ordem dos commits, desde que cada um deixe os testes verdes.
