# Feature Specification: Interface web de gestão de médicos

**Feature Branch**: `pdi/frontend`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "Com base no meu projeto, montar um front-end para ele (PDI), podendo ajustar o back-end. Design aprovado em docs/superpowers/specs/2026-11-26-frontend-design.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar os médicos ativos (Priority: P1)

A pessoa da clínica abre o sistema e vê os médicos ativos numa lista com nome, e-mail, CRM e
especialidade. Ela pode ordenar a lista por qualquer coluna e navegar entre as páginas. Hoje
essa consulta só é feita pelo Swagger.

**Why this priority**: é a porta de entrada da tela. Todas as outras ações partem da lista.

**Independent Test**: com médicos cadastrados no banco, abrir o endereço do sistema e conferir
a lista, a ordenação e a paginação.

**Acceptance Scenarios**:

1. **Given** 15 médicos ativos, **When** a pessoa abre o sistema, **Then** vê os 10 primeiros
   em ordem alfabética de nome e um controle para ir à página 2.
2. **Given** a lista aberta, **When** a pessoa clica no cabeçalho "CRM", **Then** a lista é
   ordenada por CRM crescente. Um novo clique inverte a ordem.
3. **Given** a pessoa está na página 2 ordenada por CRM, **When** recarrega o navegador,
   **Then** continua na página 2 ordenada por CRM.
4. **Given** nenhum médico ativo, **When** a pessoa abre o sistema, **Then** vê uma mensagem
   de lista vazia com um atalho para cadastrar.

---

### User Story 2 - Cadastrar médico (Priority: P1)

A pessoa preenche um formulário com os dados pessoais e o endereço do médico. Se algo estiver
errado, ela vê o motivo embaixo do campo exato.

**Why this priority**: sem cadastro, a lista fica vazia. Junto com a US1, forma o MVP.

**Independent Test**: preencher o formulário com dados válidos e ver o médico na lista.
Preencher com dados inválidos e ver os erros em cada campo.

**Acceptance Scenarios**:

1. **Given** o formulário preenchido corretamente, **When** a pessoa salva, **Then** volta para
   a lista, vê o aviso "Médico cadastrado" e encontra o médico na lista.
2. **Given** o CRM "12" (menos de 4 dígitos), **When** a pessoa tenta salvar, **Then** vê embaixo
   do campo CRM que ele precisa ter de 4 a 6 dígitos, e nada é enviado.
3. **Given** um CRM que já pertence a outro médico, ativo ou inativo, **When** a pessoa salva,
   **Then** vê embaixo do campo CRM que já existe um médico com esse CRM, e o formulário mantém
   os dados digitados.
4. **Given** um e-mail já cadastrado, **When** a pessoa salva, **Then** vê o erro embaixo do
   campo e-mail.

---

### User Story 3 - Editar médico (Priority: P2)

A pessoa abre um médico da lista e vê o formulário com os dados atuais, inclusive telefone e
endereço. Ela pode alterar nome, telefone e endereço. E-mail, CRM e especialidade aparecem
bloqueados, com a explicação de que não podem ser alterados.

**Why this priority**: corrigir um dado é frequente, mas depende de já existir cadastro.

**Independent Test**: editar o telefone de um médico e ver a alteração ao reabrir.

**Acceptance Scenarios**:

1. **Given** um médico ativo, **When** a pessoa clica em "Editar", **Then** o formulário abre
   preenchido com todos os dados atuais.
2. **Given** o formulário de edição, **When** a pessoa altera o telefone e salva, **Then** volta
   à lista com o aviso "Médico atualizado", e o novo telefone aparece ao reabrir.
3. **Given** o formulário de edição, **When** a pessoa apaga o nome e tenta salvar, **Then** vê
   que o nome não pode ficar em branco.
4. **Given** o formulário de edição, **When** a pessoa informa o CEP "abc", **Then** vê que o
   CEP precisa ter 8 dígitos, e nada é gravado.
5. **Given** o endereço de edição de um médico que não existe, **When** a pessoa o acessa,
   **Then** vê "Médico não encontrado" e um caminho de volta para a lista.

---

### User Story 4 - Excluir e reativar médico (Priority: P2)

A pessoa exclui um médico da lista ativa, depois de confirmar. Ele passa a aparecer numa lista
separada de inativos, de onde pode ser reativado com um clique.

**Why this priority**: completa o ciclo de vida do cadastro. Hoje reativar exige saber o ID.

**Independent Test**: excluir um médico, achá-lo em "Inativos", reativá-lo e vê-lo de volta
na lista de ativos.

**Acceptance Scenarios**:

1. **Given** a lista de ativos, **When** a pessoa clica em "Excluir", **Then** aparece uma
   confirmação com o nome do médico. Se cancelar, nada muda.
2. **Given** a confirmação aberta, **When** a pessoa confirma, **Then** o médico some dos ativos,
   aparece o aviso "Médico excluído" e ele passa a constar em "Inativos".
3. **Given** a lista de inativos, **When** a pessoa clica em "Reativar", **Then** o médico some
   dos inativos e volta para a lista de ativos.
4. **Given** a pessoa exclui o único médico da última página, **When** a lista é recarregada,
   **Then** ela é levada à página anterior, e não a uma página vazia.

---

### User Story 5 - Continuar usando a documentação técnica (Priority: P3)

Quem desenvolve continua acessando a documentação interativa da API (Swagger), agora por um
link na própria interface.

**Why this priority**: não é uma função nova para a clínica, mas não pode se perder.

**Independent Test**: clicar no link "Documentação da API" e ver o Swagger funcionando.

**Acceptance Scenarios**:

1. **Given** qualquer tela, **When** a pessoa clica em "Documentação da API", **Then** abre a
   documentação interativa da API.

---

### Edge Cases

- **API fora do ar ou falha de rede**: a tela mostra "Não foi possível falar com o servidor.
  Tente novamente." e não fica carregando para sempre.
- **Sessão do portal expirada** (a resposta não é dado da API): a tela mostra "Sua sessão
  expirou. Recarregue a página."
- **Ordenação inválida na URL** (por exemplo, `?sort=xyz` digitado à mão): a lista mostra a
  mensagem da API e um caminho para voltar à ordenação padrão.
- **Página além do fim na URL** (por exemplo, `?page=99`): a lista mostra o estado vazio com
  um link para a primeira página.
- **Dois cliques rápidos em "Salvar"**: o botão fica desabilitado durante o envio, e só uma
  requisição sai.
- **Recarregar o navegador ou abrir um link direto** para cadastro, edição ou inativos: a tela
  certa abre, e não um erro 404.
- **Apagar complemento ou número na edição**: o campo fica vazio depois de salvar.
- **Tela de celular**: a lista vira cartões legíveis, sem rolagem horizontal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST listar os médicos ativos com nome, e-mail, CRM e especialidade, 10
  por página, ordenados por nome por padrão.
- **FR-002**: Os usuários MUST poder ordenar a lista por nome, e-mail, CRM ou especialidade,
  crescente ou decrescente. A página e a ordenação MUST ser preservadas ao recarregar.
- **FR-003**: O sistema MUST listar os médicos inativos separadamente, com a mesma paginação e
  ordenação dos ativos.
- **FR-004**: Os usuários MUST poder cadastrar um médico com nome, e-mail, telefone, CRM,
  especialidade (Ortopedia, Cardiologia, Ginecologia ou Dermatologia) e endereço (logradouro,
  bairro, CEP, cidade e UF obrigatórios; número e complemento opcionais).
- **FR-005**: O sistema MUST validar no navegador, antes de enviar:
  - campos obrigatórios;
  - formato de e-mail;
  - CRM com 4 a 6 dígitos;
  - CEP com 8 dígitos;
  - UF entre as 27 do Brasil.
- **FR-006**: O sistema MUST recusar, no servidor, e-mail ou CRM já usados por qualquer médico,
  ativo ou inativo. O erro MUST indicar o campo em conflito, e não pode haver falha genérica.
- **FR-007**: Todo erro de validação vindo do servidor MUST indicar o campo e uma mensagem em
  português, e a tela MUST mostrá-lo embaixo do campo correspondente.
- **FR-008**: O sistema MUST permitir consultar um médico, ativo ou inativo, com todos os dados,
  incluindo telefone, endereço e situação.
- **FR-009**: Os usuários MUST poder editar nome, telefone e endereço. E-mail, CRM e
  especialidade MUST aparecer bloqueados.
- **FR-010**: Na edição, o servidor MUST recusar nome, telefone, logradouro, bairro, cidade ou UF
  em branco, e CEP fora do formato de 8 dígitos. Campos não enviados continuam como estavam.
- **FR-011**: Os usuários MUST poder excluir um médico (exclusão lógica) depois de confirmar.
- **FR-012**: Os usuários MUST poder reativar um médico a partir da lista de inativos.
- **FR-013**: Após cada ação bem-sucedida (cadastrar, atualizar, excluir, reativar), o sistema
  MUST mostrar um aviso de confirmação.
- **FR-014**: A interface MUST abrir no endereço raiz do sistema, e a documentação interativa da
  API MUST continuar disponível no endereço atual, com link na interface.
- **FR-015**: Os endpoints que já existem MUST manter o contrato atual. Clientes que já usam a
  API não podem quebrar.
- **FR-016**: A interface MUST ser acessível pelo teclado:
  - todo campo tem rótulo;
  - o foco é visível;
  - os erros são anunciados junto do campo;
  - a confirmação de exclusão prende o foco.
- **FR-017**: A interface MUST funcionar em telas de celular e de computador e respeitar o tema
  claro ou escuro do sistema operacional.
- **FR-018**: A interface e todas as mensagens MUST estar em português.

### Key Entities

- **Médico**:
  - dados: nome, e-mail (único), telefone, CRM (único, 4 a 6 dígitos), especialidade, endereço
    e situação (ativo ou inativo);
  - nasce ativo e é inativado na exclusão, sem ser apagado.
- **Endereço**: logradouro, bairro, CEP (8 dígitos), cidade, UF, número e complemento. Pertence
  a um único médico.
- **Erro de campo**: o nome do campo e a mensagem em português que explica o problema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa sem treino cadastra um médico completo em menos de 2 minutos, sem abrir
  a documentação da API.
- **SC-002**: 100% dos erros de validação e de duplicidade aparecem junto do campo que os causou.
  Nenhum vira mensagem genérica de "erro no servidor".
- **SC-003**: Reativar um médico excluído leva no máximo 2 cliques a partir da tela inicial, sem
  digitar nenhum identificador.
- **SC-004**: Todas as funções que hoje exigem o Swagger (listar, cadastrar, editar, excluir,
  reativar) podem ser feitas pela interface.
- **SC-005**: Clientes existentes da API continuam funcionando: os testes automatizados atuais
  continuam passando sem alteração de contrato.
- **SC-006**: A auditoria automática de acessibilidade da tela principal não aponta nenhuma
  violação grave.
- **SC-007**: A lista aparece em menos de 2 segundos numa conexão comum.

## Assumptions

- O acesso ao sistema no portal é controlado pelo SSO da DB1. A interface não tem login,
  cadastro de usuário nem perfis.
- Só há dados fictícios. Não há requisitos de LGPD além dos do portal.
- A quantidade de médicos é pequena (dezenas a centenas). A paginação de 10 por página basta, e
  a busca por nome fica fora do escopo.
- Complemento e número são apagados gravando texto vazio, porque "não enviado" significa "não
  alterar".
- Fora do escopo: pacientes, consultas, internacionalização e busca textual.
- A declaração da aplicação no portal (`db1app.json`) não muda nesta entrega. Fica uma tarefa de
  confirmar com o time do portal se a nova tela exige atualizar essa declaração.
