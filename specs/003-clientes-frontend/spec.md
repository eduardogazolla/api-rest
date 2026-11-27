# Feature Specification: Telas de clientes

**Feature Branch**: `pdi/clientes-frontend`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "Telas de clientes (pacientes) no front-end da Voll.med, espelhando as de médicos, com todas as telas movidas para /app (/app/medicos/..., /app/clientes/...). Design aprovado em docs/superpowers/specs/2026-11-26-clientes-frontend-design.md."

## User Scenarios & Testing *(mandatory)*

Quem usa é a equipe da clínica, que hoje gerencia médicos pela interface e clientes só pela documentação
da API.

### User Story 1 - Navegar entre médicos e clientes (Priority: P1)

A pessoa alterna entre a área de Médicos e a de Clientes pelo topo da tela. Dentro de cada área, ela
alterna entre ativos e inativos.

**Why this priority**: sem a navegação, as telas de clientes não são alcançáveis. É também a mudança que
reorganiza os endereços das telas de médico.

**Independent Test**: abrir o sistema, ir de Médicos para Clientes e voltar, e alternar entre Ativos e
Inativos em cada área.

**Acceptance Scenarios**:

1. **Given** a pessoa abre o endereço raiz, **When** a página carrega, **Then** vê a lista de médicos ativos.
2. **Given** qualquer tela de médicos (lista, cadastro ou edição), **When** ela olha o topo, **Then** "Médicos" aparece como a área atual.
3. **Given** a lista de clientes, **When** a pessoa escolhe "Inativos", **Then** vê os clientes inativos, e o endereço muda para que um F5 mantenha a escolha.
4. **Given** um link direto para a edição de um cliente, **When** a pessoa o abre ou recarrega a página, **Then** a tela certa abre, e não um erro.

---

### User Story 2 - Consultar clientes ativos (Priority: P1)

A pessoa vê os clientes ativos em páginas de 10, com nome, e-mail e CPF formatado. Ela pode ordenar por
qualquer coluna, e a página e a ordenação sobrevivem a um F5.

**Why this priority**: é a consulta do dia a dia e a base das outras ações.

**Independent Test**: com clientes cadastrados, ordenar por CPF, ir à página 2 e recarregar.

**Acceptance Scenarios**:

1. **Given** 15 clientes ativos, **When** a pessoa abre Clientes, **Then** vê os 10 primeiros por nome, com o CPF como `529.982.247-25`.
2. **Given** nenhum cliente ativo, **When** a pessoa abre Clientes, **Then** vê "Nenhum cliente ativo" e um atalho para cadastrar.
3. **Given** a API fora do ar ou a sessão expirada, **When** a lista carrega, **Then** a pessoa vê a mensagem correspondente, como já acontece com médicos.

---

### User Story 3 - Cadastrar cliente (Priority: P1)

A pessoa preenche nome, e-mail, telefone, CPF, data de nascimento e endereço. Ela pode digitar ou colar o
CPF com ou sem pontuação, e o campo sempre exibe a pontuação.

**Why this priority**: sem cadastro pela tela, a equipe continua dependendo da documentação técnica.

**Independent Test**: cadastrar um cliente válido e encontrá-lo na lista. Tentar um CPF com dígito errado e
um CPF repetido.

**Acceptance Scenarios**:

1. **Given** dados válidos, **When** a pessoa salva, **Then** volta à lista com o aviso "Cliente cadastrado".
2. **Given** um CPF com dígito verificador errado, **When** a pessoa salva, **Then** vê "CPF inválido" no campo, e nada é enviado.
3. **Given** a pessoa cola "529.982.247-25", **When** o campo recebe o valor, **Then** exibe "529.982.247-25" e o envio leva só os dígitos.
4. **Given** uma data de nascimento hoje ou futura, **When** a pessoa salva, **Then** vê "deve ser uma data no passado" no campo.
5. **Given** um CPF que já pertence a outro cliente, ativo ou inativo, **When** a pessoa salva, **Then** vê no campo CPF que ele já existe, e os dados digitados permanecem.

---

### User Story 4 - Editar cliente (Priority: P2)

A pessoa abre um cliente, vê os dados atuais e altera nome, telefone ou endereço. E-mail, CPF e data de
nascimento aparecem bloqueados.

**Why this priority**: é uma correção frequente, mas depende de existir cadastro.

**Independent Test**: editar o telefone e reabrir o cliente.

**Acceptance Scenarios**:

1. **Given** um cliente, **When** a pessoa clica em Editar, **Then** o formulário abre preenchido, com o CPF formatado e e-mail, CPF e data de nascimento bloqueados.
2. **Given** a pessoa muda só o telefone, **When** salva, **Then** volta à lista com "Cliente atualizado", e só o telefone foi alterado.
3. **Given** o endereço de edição de um cliente que não existe, **When** a pessoa o abre, **Then** vê "Cliente não encontrado" com um caminho de volta.

---

### User Story 5 - Excluir e reativar cliente (Priority: P2)

A pessoa exclui um cliente depois de confirmar. Ele vai para os inativos, de onde pode ser reativado.

**Why this priority**: completa o ciclo de vida, igual ao dos médicos.

**Independent Test**: excluir, achar o cliente em Inativos, reativar e vê-lo de volta nos ativos.

**Acceptance Scenarios**:

1. **Given** um cliente ativo, **When** a pessoa clica em Excluir e cancela, **Then** nada muda.
2. **Given** a confirmação, **When** a pessoa confirma, **Then** vê "Cliente excluído", e o cliente passa aos inativos.
3. **Given** um cliente inativo, **When** a pessoa clica em Reativar, **Then** vê "Cliente reativado", e ele volta aos ativos.
4. **Given** a pessoa exclui o único cliente da última página, **When** a lista recarrega, **Then** vai para a página anterior.

### Edge Cases

- **Endereços antigos das telas de médico** (`/inativos`, `/cadastro`, `/editar/{id}`): deixam de existir. Só a raiz continua levando aos médicos.
- **CPF colado com espaços ou outros caracteres**: só os dígitos são aproveitados, até 11.
- **CPF incompleto** (menos de 11 dígitos): a tela recusa com "deve ter 11 dígitos, sem pontuação".
- **Recurso inexistente**: qualquer erro de "não encontrado" mostra o nome da entidade certa ("Cliente não encontrado" na área de clientes).
- **Telas de médico**: continuam com o mesmo comportamento. Mudam só os endereços e a forma de chegar aos inativos.
- **Celular**: as listas de clientes viram cartões, como as de médicos, sem rolagem horizontal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todas as telas MUST ficar sob o prefixo `/app`, com médicos em `/app/medicos` e clientes em `/app/clientes`, cada área com lista, inativos, cadastro e edição. A raiz MUST levar à lista de médicos.
- **FR-002**: Abrir ou recarregar qualquer endereço de tela MUST mostrar a tela correspondente.
- **FR-003**: O topo MUST oferecer as áreas Médicos e Clientes, indicando a atual. Cada área MUST permitir alternar entre Ativos e Inativos.
- **FR-004**: A lista de clientes MUST mostrar nome, e-mail e CPF formatado, com paginação de 10, ordenação por coluna e estado guardado no endereço.
- **FR-005**: O cadastro de cliente MUST pedir nome, e-mail, telefone, CPF, data de nascimento e endereço, e validar antes de enviar:
  - campos obrigatórios;
  - formato de e-mail;
  - CPF com 11 dígitos e dígitos verificadores válidos;
  - data de nascimento anterior a hoje;
  - CEP com 8 dígitos;
  - UF da lista;
  - os mesmos limites de tamanho dos médicos.
- **FR-006**: O campo CPF MUST exibir a pontuação (`000.000.000-00`) e MUST enviar só os dígitos.
- **FR-007**: Os erros do servidor MUST aparecer no campo correspondente. Um erro sem campo MUST aparecer como aviso geral.
- **FR-008**: A edição MUST vir preenchida, MUST bloquear e-mail, CPF e data de nascimento e MUST enviar só o que mudou.
- **FR-009**: A exclusão MUST pedir confirmação. Inativos MUST poder ser reativados com um clique.
- **FR-010**: Cada ação MUST confirmar com um aviso ("Cliente cadastrado", "Cliente atualizado", "Cliente excluído" ou "Cliente reativado").
- **FR-011**: As telas de médicos MUST manter todo o comportamento atual nos novos endereços.
- **FR-012**: As telas de clientes MUST ter a mesma acessibilidade das de médicos:
  - rótulos;
  - foco visível;
  - erros ligados ao campo;
  - modal com foco preso;
  - funcionamento em celular e nos temas claro e escuro.

### Key Entities

- **Cliente**:
  - dados: nome, e-mail, telefone, CPF, data de nascimento, endereço e situação;
  - só nome, telefone e endereço são editáveis.
- **Área**: Médicos ou Clientes, cada uma com as listas de ativos e inativos, o cadastro e a edição.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: As 7 operações de clientes podem ser feitas pela interface, sem a documentação técnica.
- **SC-002**: Uma pessoa sem treino cadastra um cliente completo em menos de 2 minutos.
- **SC-003**: Em 100% das telas, o CPF aparece com pontuação.
- **SC-004**: Todo cenário de médicos que hoje passa nos testes continua passando, nos novos endereços.
- **SC-005**: A auditoria automática de acessibilidade das telas de lista e de cadastro de clientes não aponta violação grave.

## Assumptions

- O back-end de clientes (PR #13) já está na `main` e não muda.
- O app em produção tem duas pessoas nomeadas, então a troca dos endereços de médico não precisa de redirecionamento. Só a raiz redireciona.
- Fora do escopo: agendamento, busca por nome ou CPF e qualquer mudança na API.
- O deploy em produção vem depois desta entrega. Ele depende da resposta do Eduardo sobre o dado pessoal (CPF) na declaração do portal.
