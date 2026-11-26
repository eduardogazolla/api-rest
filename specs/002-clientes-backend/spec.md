# Feature Specification: Cadastro de clientes (back-end)

**Feature Branch**: `pdi/clientes-backend`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "Back-end de clientes (pacientes) da Voll.med, espelhando o de médicos: cadastrar (nome, e-mail, telefone, CPF, data de nascimento, endereço), listar ativos paginado e ordenado, listar inativos, detalhar, atualizar parcialmente (nome, telefone, endereço), exclusão lógica e reativação. Erros por campo em português (400), 404 para inexistente, 409 para CPF ou e-mail repetido (inclusive de inativo). Só back-end; a tela fica para depois."

## User Scenarios & Testing *(mandatory)*

Quem usa o cadastro de clientes é a equipe da clínica, por enquanto pela documentação interativa
da API. A tela virá numa próxima entrega e vai consumir exatamente estas funções.

### User Story 1 - Cadastrar cliente (Priority: P1)

A equipe registra um novo cliente da clínica com nome, e-mail, telefone, CPF, data de nascimento e
endereço. Dados errados são recusados com o motivo de cada campo, e um CPF ou e-mail já usado é
recusado com a indicação de qual dos dois está repetido.

**Why this priority**: sem cadastro não existe cliente. Todas as outras histórias dependem desta.

**Independent Test**: enviar um cadastro válido e consultá-lo. Enviar cadastros inválidos e
duplicados e conferir os motivos.

**Acceptance Scenarios**:

1. **Given** dados válidos, **When** a equipe cadastra o cliente, **Then** o cadastro é aceito e o cliente passa a constar como ativo.
2. **Given** um CPF com 10 dígitos, com pontuação ou com dígito verificador inválido, **When** a equipe cadastra, **Then** o cadastro é recusado indicando o campo CPF.
3. **Given** uma data de nascimento hoje ou no futuro, **When** a equipe cadastra, **Then** o cadastro é recusado indicando o campo data de nascimento.
4. **Given** um CPF já usado por outro cliente, ativo ou inativo, **When** a equipe cadastra, **Then** o cadastro é recusado como conflito, apontando o campo CPF.
5. **Given** um e-mail já usado por outro cliente, **When** a equipe cadastra, **Then** o cadastro é recusado como conflito, apontando o campo e-mail.

---

### User Story 2 - Listar clientes ativos (Priority: P1)

A equipe consulta os clientes ativos em páginas de 10, ordenados por nome, e pode escolher outra
ordenação.

**Why this priority**: é a consulta do dia a dia e a base da futura tela.

**Independent Test**: com clientes cadastrados, listar, mudar a página e a ordenação.

**Acceptance Scenarios**:

1. **Given** 15 clientes ativos, **When** a equipe lista sem parâmetros, **Then** recebe os 10 primeiros por nome, com o total de 15 e 2 páginas.
2. **Given** uma ordenação por um campo que não existe, **When** a equipe lista, **Then** recebe uma recusa explicando o parâmetro inválido.
3. **Given** clientes inativos, **When** a equipe lista os ativos, **Then** os inativos não aparecem.

---

### User Story 3 - Detalhar cliente (Priority: P2)

A equipe consulta todos os dados de um cliente, ativo ou inativo, inclusive telefone, data de
nascimento, endereço e situação.

**Why this priority**: a listagem resume. Para editar ou conferir, é preciso o registro completo.

**Independent Test**: detalhar um cliente existente e um identificador inexistente.

**Acceptance Scenarios**:

1. **Given** um cliente cadastrado, **When** a equipe o detalha, **Then** recebe todos os campos, inclusive a situação.
2. **Given** um identificador inexistente, **When** a equipe detalha, **Then** recebe a resposta de não encontrado.

---

### User Story 4 - Atualizar cliente (Priority: P2)

A equipe corrige nome, telefone ou endereço de um cliente, enviando só o que mudou. E-mail, CPF e
data de nascimento não podem ser alterados.

**Why this priority**: corrigir cadastro é frequente, mas depende de o cliente já existir.

**Independent Test**: alterar o telefone e conferir que o resto ficou igual.

**Acceptance Scenarios**:

1. **Given** um cliente, **When** a equipe envia só um novo telefone, **Then** o telefone muda e os demais dados permanecem.
2. **Given** um cliente, **When** a equipe envia nome ou telefone em branco, **Then** a alteração é recusada apontando o campo.
3. **Given** um cliente, **When** a equipe envia um CEP fora do formato, **Then** a alteração é recusada apontando o campo do endereço.
4. **Given** um cliente com complemento, **When** a equipe envia complemento vazio, **Then** o complemento é apagado.
5. **Given** um identificador inexistente, **When** a equipe atualiza, **Then** recebe a resposta de não encontrado.

---

### User Story 5 - Excluir, listar inativos e reativar (Priority: P2)

A equipe exclui um cliente sem apagar o histórico (ele passa a inativo), consulta os inativos em
separado e reativa quem voltar à clínica.

**Why this priority**: completa o ciclo de vida, igual ao dos médicos.

**Independent Test**: excluir, conferir em inativos, reativar e conferir de volta em ativos.

**Acceptance Scenarios**:

1. **Given** um cliente ativo, **When** a equipe o exclui, **Then** ele some dos ativos e aparece nos inativos, com os dados preservados.
2. **Given** um cliente inativo, **When** a equipe o reativa, **Then** ele volta aos ativos.
3. **Given** um identificador inexistente, **When** a equipe exclui ou reativa, **Then** recebe a resposta de não encontrado.

### Edge Cases

- **Corrida no cadastro**: dois cadastros simultâneos com o mesmo CPF. O segundo é recusado como conflito, nunca como erro interno.
- **Texto maior que o permitido** (nome com mais de 100 caracteres, telefone com mais de 20): recusado apontando o campo, e não confundido com duplicidade.
- **Data de nascimento em formato inválido** (por exemplo, "31/02/1990"): recusada como dado inválido.
- **CPF com pontuação** ("123.456.789-09"): recusado. O padrão é só dígitos, igual ao CEP.
- **Identificador não numérico na consulta**: recusado como requisição inválida, nunca erro interno.
- **Funções dos médicos**: continuam funcionando com o mesmo contrato. Só o texto de duas mensagens genéricas deixa de citar "médico".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST cadastrar clientes com nome, e-mail, telefone, CPF, data de nascimento e endereço (logradouro, bairro, CEP, cidade, UF; número e complemento opcionais). O cliente nasce ativo.
- **FR-002**: O sistema MUST validar:
  - campos obrigatórios;
  - formato de e-mail;
  - CPF com 11 dígitos e dígitos verificadores válidos;
  - data de nascimento anterior a hoje;
  - CEP com 8 dígitos e UF com 2 letras;
  - tamanhos máximos: nome, e-mail, logradouro, bairro, cidade e complemento até 100; telefone e número até 20.
- **FR-003**: Todo erro de validação MUST indicar o campo e uma mensagem em português.
- **FR-004**: O sistema MUST recusar CPF ou e-mail já usado por qualquer cliente, ativo ou inativo, como conflito que aponta o campo. O CPF é verificado primeiro.
- **FR-005**: O sistema MUST listar clientes ativos e, separadamente, inativos, em páginas de 10 ordenadas por nome por padrão, aceitando outra ordenação por campo.
- **FR-006**: O sistema MUST detalhar um cliente, ativo ou inativo, com todos os campos e a situação.
- **FR-007**: O sistema MUST atualizar parcialmente nome, telefone e endereço, ignorando campos não enviados. Texto vazio em número ou complemento apaga o valor.
- **FR-008**: E-mail, CPF e data de nascimento MUST NOT ser alteráveis depois do cadastro.
- **FR-009**: Excluir MUST inativar o cliente sem apagar o registro. Reativar MUST devolvê-lo aos ativos.
- **FR-010**: Identificador inexistente MUST resultar em "não encontrado", em todas as operações por identificador.
- **FR-011**: As funções de clientes MUST aparecer na documentação interativa da API, num grupo próprio "Clientes".
- **FR-012**: As funções de médicos MUST manter o contrato atual.

### Key Entities

- **Cliente**:
  - dados: nome, e-mail (único), telefone, CPF (único, 11 dígitos), data de nascimento, endereço e situação (ativo ou inativo);
  - corresponde ao paciente da clínica.
- **Endereço**: a mesma estrutura do endereço dos médicos.
- **Erro de campo**: o nome do campo e a mensagem em português.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: As 7 operações dos médicos (cadastrar, listar ativos, listar inativos, detalhar, atualizar, excluir, reativar) existem para clientes, com o mesmo comportamento de erros.
- **SC-002**: 100% dos cadastros com CPF ou e-mail repetido são recusados como conflito apontando o campo, e nenhum resulta em erro interno.
- **SC-003**: 100% dos dados inválidos listados em FR-002 são recusados com o campo e uma mensagem em português.
- **SC-004**: Todos os testes automatizados que já existem, de médicos e do front-end, continuam passando.
- **SC-005**: Cada operação nova tem pelo menos um cenário de sucesso e um de erro verificados automaticamente.

## Assumptions

- "Cliente" é o paciente da clínica. O nome segue o pedido do Eduardo.
- O CPF é digitado só com dígitos, como o CEP. A tela futura pode aceitar pontuação e retirá-la antes de enviar.
- A data de nascimento é a identidade do cliente e não é editável, assim como o CRM do médico.
- Só dados fictícios. Mesmo assim, CPF e data de nascimento são dado pessoal. A resposta do fator "dado sensível" na declaração do portal é do Eduardo e fica para o momento do deploy.
- Fora do escopo: tela de clientes, vínculo de clientes com médicos (consultas) e busca por nome ou CPF.
