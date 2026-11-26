# Implementation Plan: Cadastro de clientes (back-end)

**Branch**: `pdi/clientes-backend` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-clientes-backend/spec.md`

## Summary

Novo domínio `cliente` que espelha o de `medico` arquivo por arquivo: entidade com `Endereco`
embutido, repository, service, controller com métodos de uma linha, DTOs em record e as mesmas 7
operações em `/clientes`.

Duas peças de `infra/` deixam de ser "de médico" para servir aos dois domínios:
- a `CadastroDuplicadoException`;
- as mensagens genéricas do `TratadorDeErros`.

Entra também um tratamento de corpo JSON ilegível (data em formato inválido), que devolve 400 no
mesmo formato `[{campo, mensagem}]`.

## Technical Context

**Language/Version**: Java 17

**Primary Dependencies**: Spring Boot 4.1.1 (webmvc, data-jpa, validation, flyway), Hibernate Validator 9.1 (`@CPF`), springdoc 3.1.1. **Nenhuma dependência nova.**

**Storage**: tabela nova `clientes`, criada pela migration V4 nas duas versões: `db/migration` (MySQL, também usada pelo H2 dos testes) e `db/postgresql` (portal).

**Testing**: JUnit 5, Mockito, MockMvc com `@SpringBootTest` e perfil `test` (H2), e `Validator` para os DTOs.

**Target Platform**: o mesmo `.jar` e a mesma imagem do Portal DB1.

**Project Type**: API REST (domínio novo num serviço que já existe).

**Performance Goals**: iguais aos de médicos, com página de 10 itens.

**Constraints**:
- contratos de `/medicos` intactos;
- `mvn test` sem MySQL e sem Node;
- mensagens em português.

**Scale/Scope**: 1 entidade, 7 endpoints, 1 migration (em 2 dialetos).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano atende | Status |
|---|---|---|
| I. Camadas | `ClienteController` (1 linha por método) → `ClienteService` → `ClienteRepository`. DTOs em record, injeção pelo construtor e pacote por domínio (`cliente/`). | ✅ |
| II. Testes | TDD com positivo e exceção por operação, nomes `deve…Quando…` com `@DisplayName`. O H2 roda a V4 MySQL. | ✅ |
| III. Erros | `buscarClientePorId` com `orElseThrow` (404). Duplicidade dá 409 e validação dá 400 `[{campo, mensagem}]`, todos tratados no `TratadorDeErros`. JSON ilegível vira 400, e não erro genérico. | ✅ |
| IV. Simplicidade | Reusa `Endereco`, `DadosEndereco` e `DadosAtualizacaoEndereco`. A `@CPF` do Hibernate Validator, que já está no classpath, evita código próprio de dígito verificador. Nada "para o futuro". | ✅ |
| V. Contrato estável | Médicos mantêm métodos, caminhos e formatos. Só o **texto** de 2 mensagens genéricas deixa de citar "médico" (o formato não muda). O front não depende desses textos. | ✅ |
| Restrições | Migration nos dois dialetos e nenhum segredo. O dado pessoal (CPF) é fictício, e a declaração do portal fica para o deploy. | ✅ |

**Re-check pós-design**: ✅ sem violações (ver [research.md](./research.md)).

## Project Structure

### Documentation (this feature)

```text
specs/002-clientes-backend/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/api-clientes.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
src/main/java/med/voll/api/
├── cliente/                              # NOVO, espelho de medico/
│   ├── Cliente.java                      # @Entity, @Embedded Endereco, excluir()/ativar()
│   ├── ClienteController.java            # @RestController /clientes, @Tag "Clientes"
│   ├── ClienteRepository.java
│   ├── ClienteService.java
│   ├── DadosCadastroCliente.java
│   ├── DadosAtualizacaoCliente.java
│   ├── DadosDetalhamentoCliente.java
│   └── DadosListagemCliente.java
├── infra/
│   ├── CadastroDuplicadoException.java   # MOVIDA de medico/
│   └── TratadorDeErros.java              # mensagens genéricas + corpo ilegível
└── medico/MedicoService.java             # só o import da exceção muda

src/main/resources/db/migration/V4__create-table-clientes.sql    # MySQL e H2
src/main/resources/db/postgresql/V4__create-table-clientes.sql   # portal

src/test/java/med/voll/api/cliente/       # ClienteTest, ClienteServiceTest, Dados*Test, ClienteController*Test
```

**Structure Decision**: pacote por domínio, como já está documentado no README e no `Rules.md`.

## Complexity Tracking

Nenhuma violação a justificar.
