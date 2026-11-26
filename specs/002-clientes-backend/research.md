# Research: Cadastro de clientes (back-end)

Cada item segue o formato Decisão / Motivo / Alternativas.

## R1. Validação do CPF

- **Decisão**: `@NotBlank` + `@Pattern("\\d{11}")` ("deve ter 11 dígitos, sem pontuação") + `@CPF` do
  Hibernate Validator ("CPF inválido").
- **Motivo**:
  - o padrão "só dígitos" é o mesmo do CEP e do CRM;
  - a `@CPF` confere os dígitos verificadores sem código próprio, e já vem no classpath pela `spring-boot-starter-validation`.
- **Alternativas**:
  - escrever o algoritmo de dígitos à mão: código a mais para testar, contra o princípio IV;
  - aceitar pontuação e normalizar no servidor: mudaria o padrão já usado no CEP.
- **Observação**: um CPF com pontuação dispara a mensagem do `@Pattern`, e a `@CPF` aceitaria. Os
  testes cobrem os dois casos.

## R2. Data de nascimento

- **Decisão**: `LocalDate dataNascimento` com `@NotNull` + `@Past` ("deve ser uma data no passado"). O JSON
  usa o formato ISO `"1990-05-20"`, que é o padrão do Jackson 3 no Boot 4.
- **Coluna**: `data_nascimento date not null`. O Spring Boot usa nomes de coluna em snake_case por padrão,
  como já acontece com os campos do médico.
- **Não editável**: é a identidade do cliente, como o CRM.

## R3. JSON ilegível (ex.: `"dataNascimento": "31/02/1990"`)

- **Decisão**: novo handler de `HttpMessageNotReadableException` no `TratadorDeErros`, que responde 400 com
  `[{campo, mensagem}]`. O `campo` vem do caminho da falha no Jackson, quando ele existe (por exemplo,
  `dataNascimento`), e a mensagem é "formato inválido". Sem caminho, `campo` é null e a mensagem é
  "Corpo da requisição inválido.".
- **Motivo**: hoje esse caso devolve o corpo padrão do Spring, que não tem campo. A data é o primeiro campo
  que pode quebrar a leitura do JSON. O handler também vale para médicos, por exemplo com uma especialidade
  inexistente, o que é uma melhoria compatível.
- **Alternativas**: receber a data como `String` e validar à mão. Seria mais código e fugiria do tipo correto.

## R4. Exceção de duplicidade compartilhada

- **Decisão**: mover `medico/CadastroDuplicadoException` para `infra/CadastroDuplicadoException`, mantendo
  `(campo, mensagem)`. Cada Service monta a sua mensagem ("Já existe um cliente com este CPF (ele pode
  estar inativo).").
- **Motivo**: duplicar a classe em `cliente/` violaria a regra 1 do `Rules.md` (não duplicar lógica). Ela é
  transversal, então pertence a `infra/`.

## R5. Mensagens genéricas do `TratadorDeErros`

- **Decisão**:
  - violação de unicidade sem campo: "Já existe um médico com estes dados." passa a
    "Já existe um cadastro com estes dados.";
  - sort inválido: "Use uma propriedade do médico, por exemplo: nome ou crm,desc" passa a
    "Use um campo da listagem, por exemplo: nome ou nome,desc".
- **Motivo**: o tratador é um só para os dois domínios. Só o texto muda, e o formato e o status ficam iguais. O
  `TratadorDeErrosTest` e o README são ajustados.

## R6. Ordem da checagem de duplicidade

- **Decisão**: CPF primeiro, depois e-mail, uma exceção por vez, como o médico faz (CRM e depois e-mail).
- A constraint unique do banco continua como rede de segurança, e a violação vira 409 pelo handler que já existe.
