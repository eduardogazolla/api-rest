# 🩺 Voll.med API

API REST em **Java 17 + Spring Boot 4** para o cadastro e gerenciamento de médicos da clínica fictícia **Voll.med**. Projeto iniciado no curso **[Spring Boot 3: desenvolva uma API Rest em Java](https://www.alura.com.br/)** da Alura e evoluído durante o meu PDI, com camada de serviço, tratamento de erros, testes unitários e refatoração com Clean Code.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8-blue)
![Flyway](https://img.shields.io/badge/Flyway-migrations-red)
![JUnit](https://img.shields.io/badge/JUnit%205-Mockito-25A162)
![Status](https://img.shields.io/badge/status-em%20evolu%C3%A7%C3%A3o-yellow)

---

## 📌 Sobre o projeto

A Voll.med API implementa um **CRUD completo de médicos** com validações, paginação, ordenação, exclusão lógica e reativação, seguindo boas práticas de uma API REST:

- Arquitetura em camadas: **Controller → Service → Repository**;
- Pacotes **organizados por domínio** (`medico/`, `endereco/`), com o que é transversal em `infra/`;
- Uso de **DTOs (records)** para entrada e saída de dados;
- Validação de dados de entrada com **Bean Validation**;
- **Tratamento de erros centralizado**: recurso inexistente retorna `404`, e não `500`;
- Versionamento do banco com **migrations Flyway**;
- Persistência com **Spring Data JPA** (Hibernate) em **MySQL**;
- **Testes unitários** com JUnit 5 e Mockito, rodando sem depender do MySQL;
- **Front-end em React + TypeScript** (pasta `frontend/`), servido pelo mesmo `.jar` da API.

### 🖥️ Interface web

A raiz do sistema (`/`) abre uma interface para a equipe da clínica cadastrar, consultar, editar, excluir e reativar médicos sem usar o Swagger. O Swagger continua disponível em `/swagger-ui/index.html` e tem um link no topo da interface.

| Tela | Rota | O que faz |
|---|---|---|
| Médicos ativos | `/` | Lista paginada, ordenável por coluna. Página e ordenação ficam na URL (o F5 mantém) |
| Inativos | `/inativos` | Médicos excluídos, com o botão **Reativar** |
| Novo médico | `/cadastro` | Formulário com validação no navegador e erros do servidor embaixo de cada campo |
| Editar médico | `/editar/{id}` | Formulário já preenchido. E-mail, CRM e especialidade ficam bloqueados |

O desenho (spec, plano e tarefas) foi feito com o [GitHub Spec Kit](https://github.com/github/spec-kit) e está em `specs/001-frontend-medicos/`. Os princípios do projeto estão em `.specify/memory/constitution.md`.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| Java 17 | Linguagem |
| Spring Boot 4 | Framework base |
| Spring Web | Controllers REST |
| Spring Data JPA | Persistência e repositórios |
| Bean Validation | Validação de campos (`@Valid`, `@NotBlank`, `@Pattern`...) |
| MySQL | Banco de dados da aplicação |
| Flyway | Controle de versão do schema (migrations) |
| Lombok | Redução de código boilerplate (`@Getter`, `@NoArgsConstructor`...) |
| SpringDoc OpenAPI | Documentação e interface Swagger UI |
| JUnit 5 + Mockito | Testes unitários |
| H2 | Banco em memória usado **só nos testes** |
| Spring Boot DevTools | Reinício automático em desenvolvimento |
| Maven | Gerenciador de dependências e build |
| React 19 + TypeScript | Interface web (`frontend/`) |
| Vite | Servidor de desenvolvimento e build do front-end |
| React Router | Rotas das telas |
| Vitest + Testing Library | Testes do front-end |

---

## ✅ Funcionalidades

- [x] Cadastrar médico
- [x] Listar médicos ativos (paginado e ordenado)
- [x] Atualizar dados do médico (atualização parcial)
- [x] Excluir médico (**exclusão lógica**, sem apagar o registro)
- [x] Reativar médico excluído
- [x] Validação dos dados de entrada (incluindo nome e telefone em branco na atualização)
- [x] Retorno `404` para médico inexistente
- [x] Migrations versionadas com Flyway
- [x] Interface Swagger UI para testar a API pelo navegador
- [x] Detalhar médico com todos os dados (`GET /medicos/{id}`)
- [x] Listar médicos inativos (`GET /medicos/inativos`)
- [x] Erros de validação por campo, em português (`[{campo, mensagem}]`)
- [x] `409` para CRM ou e-mail já cadastrados, mesmo de médico inativo
- [x] Interface web (React) servida pelo próprio `.jar`

---

## 🗂️ Estrutura de diretórios

```
api
├── frontend                                   # interface web (React + TypeScript + Vite)
│   ├── src
│   │   ├── api                                # cliente HTTP, chamadas por endpoint, tipos dos DTOs
│   │   ├── components                         # Cabecalho, TabelaMedicos, Paginacao, Campo, ModalConfirmacao, Aviso
│   │   ├── dominio                            # especialidades, UFs e validação do formulário
│   │   ├── pages                              # ListaMedicos (ativos/inativos) e FormularioMedico (cadastro/edição)
│   │   └── styles                             # tokens de cor/tipografia e estilos globais
│   ├── package.json
│   └── vite.config.ts                         # proxy para a API e configuração do Vitest
├── src
│   ├── main
│   │   ├── java/med/voll/api
│   │   │   ├── endereco
│   │   │   │   ├── DadosAtualizacaoEndereco.java  # endereço parcial do PUT (só formato)
│   │   │   │   ├── DadosEndereco.java
│   │   │   │   └── Endereco.java              # @Embeddable
│   │   │   ├── infra
│   │   │   │   ├── HealthController.java      # GET /health
│   │   │   │   ├── HomeController.java        # rotas de tela → index.html do front
│   │   │   │   └── TratadorDeErros.java       # @RestControllerAdvice (400, 404, 409)
│   │   │   ├── medico
│   │   │   │   ├── CadastroDuplicadoException.java
│   │   │   │   ├── DadosAtualizacaoMedico.java
│   │   │   │   ├── DadosCadastroMedico.java
│   │   │   │   ├── DadosDetalhamentoMedico.java
│   │   │   │   ├── DadosListagemMedico.java
│   │   │   │   ├── Especialidade.java         # enum
│   │   │   │   ├── Medico.java                # @Entity
│   │   │   │   ├── MedicoController.java      # @RestController
│   │   │   │   ├── MedicoRepository.java
│   │   │   │   └── MedicoService.java         # @Service (regras de negócio)
│   │   │   └── ApiApplication.java
│   │   └── resources
│   │       ├── db/migration
│   │       │   ├── V1__create-trable-medicos.sql
│   │       │   ├── V2__alter-table-medicos-add-colum-telefone.sql
│   │       │   └── V3__alter-table-medicos-add-colum-ativo.sql
│   │       ├── db/postgresql                # migrations do deploy (PostgreSQL)
│   │       ├── static/                      # front compilado (gerado no build, fora do Git)
│   │       ├── application.properties
│   │       └── application-prod.properties  # perfil do deploy
│   └── test                                 # JUnit, Mockito e MockMvc (ver seção Testes)
├── specs/001-frontend-medicos                 # spec, plano e tarefas do front (Spec Kit)
├── .specify                                   # constituição e templates do Spec Kit
├── Dockerfile                                 # build para o Portal de Deploy DB1 (front + API)
├── db1app.json                                # declaração de governança do portal
├── Rules.md                                   # padrões de código do projeto
├── mvnw / mvnw.cmd
└── pom.xml
```

> Os nomes das migrations têm erros de digitação (`trable`, `colum`), mas **não devem ser renomeados**: o Flyway guarda um checksum de cada migration já executada.

---

## 🧱 Modelo de domínio

**Médico**

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `Long` | Gerado automaticamente (`IDENTITY`) |
| `nome` | `String` | Obrigatório |
| `email` | `String` | Obrigatório, formato de e-mail |
| `telefone` | `String` | Obrigatório |
| `crm` | `String` | Obrigatório, padrão de 4 a 6 dígitos |
| `especialidade` | `Especialidade` | Enum (`@Enumerated(EnumType.STRING)`) |
| `endereco` | `Endereco` | Objeto embutido (`@Embedded`) na mesma tabela |
| `ativo` | `Boolean` | Controla a exclusão lógica |

**Endereço** (`@Embeddable`): `logradouro`, `bairro`, `cep`, `cidade`, `uf`, `complemento`, `numero`.

---

## 🔌 Endpoints

Base URL: `http://localhost:8080`

> 💡 A forma mais fácil de testar é pelo **Swagger UI**: abra `http://localhost:8080` (ou `/swagger-ui/index.html`) e use o botão **Try it out** em cada endpoint. A especificação OpenAPI fica em `/v3/api-docs`.

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| `POST` | `/medicos` | Cadastra um novo médico | `200` · `400` dados inválidos · `409` CRM ou e-mail já cadastrado |
| `GET` | `/medicos` | Lista médicos ativos (paginado) | `200` · `400` sort inválido |
| `GET` | `/medicos/inativos` | Lista médicos inativos (paginado) | `200` · `400` sort inválido |
| `GET` | `/medicos/{id}` | Detalha um médico (ativo ou inativo), com telefone e endereço | `200` · `404` |
| `PUT` | `/medicos` | Atualiza dados de um médico | `200` · `400` · `404` |
| `PATCH` | `/medicos/{id}/ativar` | Reativa um médico excluído | `200` · `404` |
| `DELETE` | `/medicos/{id}` | Inativa um médico (exclusão lógica) | `200` · `404` |

### Cadastrar médico — `POST /medicos`

```json
{
  "nome": "Rodrigo Ferreira",
  "email": "rodrigo@voll.med",
  "telefone": "11999999999",
  "crm": "123456",
  "especialidade": "CARDIOLOGIA",
  "endereco": {
    "logradouro": "Rua Exemplo",
    "bairro": "Centro",
    "cep": "12345678",
    "cidade": "São Paulo",
    "uf": "SP",
    "complemento": "Sala 10",
    "numero": "100"
  }
}
```

### Listar médicos — `GET /medicos`

Retorna apenas médicos **ativos**, com paginação e ordenação padrão por `nome` (10 itens por página). Parâmetros opcionais:

```
GET /medicos?size=5&page=0&sort=crm,desc
```

Resposta (resumida, via `DadosListagemMedico`):

```json
{
  "content": [
    {
      "id": 1,
      "nome": "Rodrigo Ferreira",
      "email": "rodrigo@voll.med",
      "crm": "123456",
      "especialidade": "CARDIOLOGIA"
    }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 10 },
  "totalElements": 1,
  "totalPages": 1
}
```

### Atualizar médico — `PUT /medicos`

Apenas `nome`, `telefone` e `endereco` podem ser alterados, e o `id` é obrigatório. A atualização é **parcial**:

- campo **ausente ou `null`** → não é alterado;
- `nome` ou `telefone` **em branco** (`""` ou `"   "`) → `400 Bad Request`;
- `id` inexistente → `404 Not Found`.

```json
{
  "id": 1,
  "nome": "Rodrigo F. Souza",
  "telefone": "11888888888"
}
```

### Reativar médico — `PATCH /medicos/{id}/ativar`

Marca `ativo = true` em um médico excluído, que volta a aparecer na listagem. ID inexistente → `404`.

### Excluir médico — `DELETE /medicos/{id}`

Não remove o registro: apenas marca `ativo = false`, e o médico deixa de aparecer na listagem. ID inexistente → `404`.

---

## 📖 Usando o Swagger UI

O Swagger UI é a interface para testar a API pelo navegador, sem Postman.

| Onde | Endereço |
|---|---|
| Local | `http://localhost:8080/swagger-ui/index.html` |
| Portal DB1 | `https://voll-med-eduardo.apps.db1group.com/swagger-ui/index.html` (exige login DB1) |

A raiz (`/`) agora abre a interface web, que tem o link **Documentação da API** no topo.

**Para chamar qualquer endpoint:** clique nele para abrir → **Try it out** → preencha → **Execute**. A resposta aparece logo abaixo, com o status HTTP e o corpo.

### Listar médicos — `GET /medicos`

Os três campos são opcionais. Deixe tudo em branco para ver a primeira página.

| Campo | O que colocar | Exemplo |
|---|---|---|
| `page` | Número da página, **começando em 0** | `0` |
| `size` | Quantos médicos por página | `10` |
| `sort` | **Uma propriedade por item**, opcionalmente com a direção depois da vírgula. Use **Add string item** para adicionar outra | `nome` · `crm,desc` · `especialidade,asc` |

> ⚠️ No `sort`, digite só o texto, **sem aspas e sem colchetes**. Escrever `["nome"]`, ou usar uma propriedade que não existe, retorna `400` com a mensagem de como usar o parâmetro.

Propriedades que dá para ordenar: `nome`, `email`, `crm`, `especialidade`, `telefone`.

### Cadastrar médico — `POST /medicos`

O corpo já vem preenchido com um exemplo válido. Antes de executar, troque o `email` e o `crm`: os dois são **únicos**, então repetir um já cadastrado gera erro.

### Atualizar médico — `PUT /medicos`

Informe o `id` e **só os campos que quer mudar**. Apague do exemplo os campos que não vão mudar, porque campo ausente não é alterado:

```json
{
  "id": 1,
  "telefone": "44988887777"
}
```

### Excluir e reativar — `DELETE /medicos/{id}` e `PATCH /medicos/{id}/ativar`

Preencha o `id` no campo do caminho. O médico excluído some do `GET` e volta depois do `PATCH`.

### Respostas mais comuns

| Status | Significa |
|---|---|
| `200` | Deu certo |
| `400` | Algum dado inválido. O corpo é uma lista `[{"campo": "endereco.cep", "mensagem": "deve ter 8 dígitos, sem traço"}]` |
| `404` | Não existe médico com esse `id` |
| `409` | CRM ou e-mail já usado por outro médico (mesmo inativo). Mesmo formato de lista do `400` |

---

## ▶️ Como executar

### Pré-requisitos

- JDK 17+
- Maven 3.8+ (ou use o wrapper `./mvnw` / `mvnw.cmd`)
- MySQL 8+ em execução

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/eduardogazolla/api-rest.git
   cd api-rest
   ```

2. **Crie o banco de dados**
   ```sql
   CREATE DATABASE vollmed_api;
   ```

3. **Configure o acesso ao banco.** As credenciais vêm de variáveis de ambiente, com valores padrão para desenvolvimento local:
   ```properties
   spring.datasource.url=${DB_URL:jdbc:mysql://localhost/vollmed_api}
   spring.datasource.username=${DB_USER:root}
   spring.datasource.password=${DB_PASSWORD:root}
   ```
   Se o seu MySQL local usa `root`/`root`, não é preciso fazer nada. Caso contrário, defina as variáveis `DB_URL`, `DB_USER` e `DB_PASSWORD` antes de executar.

4. **Execute a aplicação**
   ```bash
   ./mvnw spring-boot:run        # Linux / macOS
   .\mvnw.cmd spring-boot:run    # Windows
   ```
   O Flyway aplica as migrations automaticamente na primeira inicialização.

5. **Teste** usando Insomnia, Postman ou `curl`:
   ```bash
   curl http://localhost:8080/medicos
   ```

### Front-end

Pré-requisito: **Node 24** e npm.

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173 — com a API rodando no :8080
```

O Vite repassa `/medicos`, `/swagger-ui` e `/v3` para o `localhost:8080`, então tela e API ficam na mesma origem e não é preciso CORS.

Para testar tela e API juntas como no portal (um só `.jar`):

```bash
cd frontend && npm run build && cd ..
rm -rf src/main/resources/static && mkdir -p src/main/resources/static
cp -r frontend/dist/. src/main/resources/static/      # pasta no .gitignore
./mvnw spring-boot:run                                 # http://localhost:8080
```

> Para não misturar dados de teste com o seu banco, rode com um banco separado:
> `DB_URL='jdbc:mysql://localhost/vollmed_e2e?createDatabaseIfNotExist=true' ./mvnw spring-boot:run`

---

## 🧪 Testes

```bash
./mvnw test        # Linux / macOS
.\mvnw.cmd test    # Windows
```

**Não é preciso ter o MySQL rodando:** os testes que sobem a aplicação usam o perfil `test`, com um banco **H2 em memória** (`src/test/resources/application-test.properties`).

| Classe | O que testa |
|---|---|
| `MedicoTest` | Regras da entidade (JUnit puro): criação ativa, exclusão lógica, atualização parcial, reativação |
| `MedicoServiceTest` | Regras do serviço com **Mockito** (repository simulado): cenários positivos e de exceção de cada operação do CRUD |
| `DadosAtualizacaoMedicoTest` | Validação do formulário de atualização com `Validator`: nome e telefone em branco recusados, `null` aceito |
| `HealthControllerTest` / `HomeControllerTest` | Health check e encaminhamento das rotas de tela para o `index.html` |
| `RotasDaTelaTest` | `/`, `/inativos`, `/cadastro` e `/editar/{id}` devolvem a interface (F5 e link direto funcionam) |
| `MedicoControllerOrdenacaoTest` | Teste de integração com **MockMvc**: `sort` inválido retorna `400`, `sort` válido retorna `200` |
| `MedicoControllerValidacaoTest` | Erros de validação saem como `[{campo, mensagem}]`, em português |
| `MedicoControllerDuplicidadeTest` | CRM ou e-mail repetido retorna `409` apontando o campo, inclusive de médico inativo |
| `MedicoControllerDetalhamentoTest` | `GET /medicos/{id}` (200 e 404) e validação do endereço no `PUT` |
| `MedicoControllerInativosTest` | `GET /medicos/inativos` só traz inativos e não se confunde com `/{id}` |
| `DadosAtualizacaoEnderecoTest` | Endereço na atualização: campos nulos aceitos, CEP fora do padrão e texto em branco recusados |
| `TratadorDeErrosTest` | Violação de integridade do banco vira `409`, e não `500` |
| `SwaggerDocumentacaoTest` | Swagger documenta os endpoints novos e continua disponível |
| `ApiApplicationTests` | A aplicação sobe e as migrations rodam (H2) |

**Front-end** (`cd frontend && npm test`): Vitest + Testing Library, com o `fetch` simulado. Cobre o cliente HTTP (cada tipo de erro, incluindo sessão expirada), validação local, componentes (tabela, paginação, campo, modal) e as telas de lista e formulário.

---

## ☁️ Deploy (Portal de Deploy DB1)

A API está preparada para o [Portal de Deploy DB1](https://apps.db1group.com):

| Arquivo | Papel |
|---|---|
| `Dockerfile` | Testa e compila o front-end (Node 24), copia para `static/`, compila com Maven e roda o `.jar` com Java 17, no perfil `prod` |
| `db1app.json` | Declaração de governança exigida pelo portal |
| `application-prod.properties` | Perfil de produção: migrations do PostgreSQL e configuração do proxy |
| `db/postgresql/` | Migrations em sintaxe PostgreSQL (o portal provisiona o banco e injeta as credenciais) |

Health check: `GET /health` → `ok`. No portal, o acesso exige login DB1, e o Swagger UI é a interface para usar a API pelo navegador.

---

## 📐 Padrões de código

As regras de Clean Code do projeto estão no **[`Rules.md`](Rules.md)**. Elas servem como guia para revisar o código e como instruções para ferramentas de IA gerarem código no padrão do projeto.

---

## 📚 Conceitos aprendidos

**No curso**

- Criação de projeto com **Spring Initializr** e estrutura de diretórios do Spring Boot
- Criação de controllers e mapeamentos (`@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`)
- Uso de **records** como DTOs de entrada e saída
- Mapeamento de entidades JPA (`@Entity`, `@Table`, `@Embedded`, `@Embeddable`, `@Enumerated`)
- Repositórios com **Spring Data JPA** e *query methods* (`findAllByAtivoTrue`)
- Migrations com **Flyway** (criação e alteração incremental de tabelas)
- Validações com **Bean Validation** (`@Valid`, `@NotBlank`, `@Email`, `@Pattern`, `@NotNull`)
- Paginação e ordenação com `Pageable` e `@PageableDefault`
- Atualização parcial com `@Transactional` e método de domínio
- **Exclusão lógica** em vez de exclusão física

**No PDI**

- Separação em camada de **Service** e **injeção de dependência pelo construtor**
- Organização de pacotes **por domínio**
- Tratamento de erros com `findById` + `orElseThrow` e `@RestControllerAdvice` (`404` em vez de `500`)
- Endpoint de alteração pontual com `@PatchMapping`
- Testes unitários com **JUnit 5** (`assertEquals`, `assertThrows`, `assertAll`) e **Mockito** (`@Mock`, `@InjectMocks`, `when`, `verify`, `ArgumentCaptor`)
- Ciclo **vermelho → verde** para corrigir bugs
- Testes de validação com `Validator`, sem subir a aplicação
- Perfil de teste (`@ActiveProfiles`) com **H2 em memória**
- **Clean Code**: nomes, funções pequenas, sem duplicação, comentários só para o porquê, sem código morto
- Credenciais por **variáveis de ambiente**

---

## 🚀 Próximos passos

- [x] Tratamento de erros padronizado (`@RestControllerAdvice`) — `404` para recurso inexistente
- [x] Testes unitários (JUnit, Mockito)
- [ ] Retornar códigos HTTP adequados com `ResponseEntity` (201, 204...)
- [ ] Testes de controller com `@WebMvcTest`
- [ ] Teste de repository com `@DataJpaTest`, para validar o filtro de médicos ativos
- [ ] Cobertura de testes com JaCoCo
- [ ] GitHub Actions rodando os testes em todo Pull Request
- [ ] Endpoint de detalhamento de médico (`GET /medicos/{id}`)
- [ ] Cadastro de pacientes e agendamento de consultas
- [ ] Autenticação e autorização com Spring Security + JWT
- [x] Documentação com Swagger / SpringDoc OpenAPI

---

## 🎓 Certificação

Projeto iniciado no curso **Spring Boot 3: desenvolva uma API Rest em Java** — Alura.

---

## 👤 Autor

**Eduardo Gazolla**
[LinkedIn](https://www.linkedin.com/in/eduardogazolla) · [GitHub](https://github.com/eduardogazolla)
