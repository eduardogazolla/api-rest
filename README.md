# 🩺 Voll.med API

API REST em **Java 17 + Spring Boot 3** para o cadastro e gerenciamento de médicos da clínica fictícia **Voll.med**. Projeto desenvolvido durante o curso **[Spring Boot 3: desenvolva uma API Rest em Java](https://www.alura.com.br/)** da Alura.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8-blue)
![Flyway](https://img.shields.io/badge/Flyway-migrations-red)
![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-success)

---

## 📌 Sobre o projeto

A Voll.med API implementa um **CRUD completo de médicos** com validações, paginação, ordenação e exclusão lógica, seguindo boas práticas de uma API REST:

- Separação em camadas (controller, domínio, repository);
- Uso de **DTOs (records)** para entrada e saída de dados;
- Validação de dados de entrada com **Bean Validation**;
- Versionamento do banco com **migrations Flyway**;
- Persistência com **Spring Data JPA** (Hibernate) em **MySQL**.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| Java 17 | Linguagem |
| Spring Boot 3 | Framework base |
| Spring Web | Controllers REST |
| Spring Data JPA | Persistência e repositórios |
| Bean Validation | Validação de campos (`@Valid`, `@NotBlank`, etc.) |
| MySQL | Banco de dados relacional |
| Flyway | Controle de versão do schema (migrations) |
| Lombok | Redução de código boilerplate (`@Getter`, `@NoArgsConstructor`...) |
| Spring Boot DevTools | Reinício automático em desenvolvimento |
| Maven | Gerenciador de dependências e build |

---

## ✅ Funcionalidades

- [x] Cadastrar médico
- [x] Listar médicos ativos (paginado e ordenado)
- [x] Atualizar dados do médico
- [x] Excluir médico (**exclusão lógica**, sem apagar o registro)
- [x] Validação dos dados de entrada
- [x] Migrations versionadas com Flyway

---

## 🗂️ Estrutura de diretórios

```
api
├── src
│   ├── main
│   │   ├── java/med/voll/api
│   │   │   ├── controller
│   │   │   │   ├── HelloController.java
│   │   │   │   └── MedicoController.java
│   │   │   ├── endereco
│   │   │   │   ├── DadosEndereco.java
│   │   │   │   └── Endereco.java          # @Embeddable
│   │   │   ├── medico
│   │   │   │   ├── DadosAtualizacaoMedico.java
│   │   │   │   ├── DadosCadastroMedico.java
│   │   │   │   ├── DadosListagemMedico.java
│   │   │   │   ├── Especialidade.java     # enum
│   │   │   │   ├── Medico.java            # @Entity
│   │   │   │   └── MedicoRepository.java
│   │   │   └── ApiApplication.java
│   │   └── resources
│   │       ├── db/migration
│   │       │   ├── V1__create-table-medicos.sql
│   │       │   ├── V2__alter-table-medicos-add-column-telefone.sql
│   │       │   └── V3__alter-table-medicos-add-column-ativo.sql
│   │       └── application.properties
│   └── test
├── .gitignore
├── mvnw / mvnw.cmd
└── pom.xml
```

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

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/medicos` | Cadastra um novo médico |
| `GET` | `/medicos` | Lista médicos ativos (paginado) |
| `PUT` | `/medicos` | Atualiza dados de um médico |
| `DELETE` | `/medicos/{id}` | Inativa um médico (exclusão lógica) |

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

Apenas `nome`, `telefone` e `endereco` podem ser alterados. O `id` é obrigatório.

```json
{
  "id": 1,
  "nome": "Rodrigo F. Souza",
  "telefone": "11888888888"
}
```

### Excluir médico — `DELETE /medicos/{id}`

Não remove o registro: apenas marca `ativo = false`, e o médico deixa de aparecer na listagem.

---

## ▶️ Como executar

### Pré-requisitos

- JDK 17+
- Maven 3.8+ (ou use o wrapper `./mvnw`)
- MySQL 8+ em execução

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/<seu-usuario>/<seu-repositorio>.git
   cd <seu-repositorio>
   ```

2. **Crie o banco de dados**
   ```sql
   CREATE DATABASE vollmed_api;
   ```

3. **Configure o acesso** em `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost/vollmed_api
   spring.datasource.username=root
   spring.datasource.password=root

   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.format_sql=true
   ```
   > 💡 Em ambientes reais, **não deixe credenciais fixas no código**. Use variáveis de ambiente, por exemplo `${DB_USER}` e `${DB_PASSWORD}`.

4. **Execute a aplicação**
   ```bash
   ./mvnw spring-boot:run
   ```
   O Flyway aplica as migrations automaticamente na primeira inicialização.

5. **Teste** usando Insomnia, Postman ou `curl`:
   ```bash
   curl http://localhost:8080/medicos
   ```

---

## 📚 Conceitos aprendidos

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

---

## 🚀 Próximos passos

- [ ] Tratamento de erros padronizado (`@RestControllerAdvice`)
- [ ] Retornar códigos HTTP adequados com `ResponseEntity` (201, 204, 404...)
- [ ] Endpoint de detalhamento de médico (`GET /medicos/{id}`)
- [ ] Cadastro de pacientes e agendamento de consultas
- [ ] Autenticação e autorização com Spring Security + JWT
- [ ] Testes automatizados (JUnit, Mockito, testes de integração)
- [ ] Documentação com Swagger / SpringDoc OpenAPI

---

## 🎓 Certificação

Projeto concluído no curso **Spring Boot 3: desenvolva uma API Rest em Java** — Alura.

---

## 👤 Autor

**<Seu Nome>**
[LinkedIn](https://www.linkedin.com/in/eduardogazolla) · [GitHub](https://github.com/eduardogazolla)