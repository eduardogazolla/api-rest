# Research: Telas de clientes

Cada item segue o formato Decisão / Motivo / Alternativas.

## R1. Configuração por área em vez de dois componentes de página

- **Decisão**: `dominio/recursos.ts` exporta `MEDICOS` e `CLIENTES`, cada uma com o tipo `AreaDeCadastro<L>`:
  rotas, textos, colunas da tabela e funções da API. A `ListaCadastros` recebe `area` e `modo`.
- **Motivo**: os textos são só troca de palavra ("médico" por "cliente"; os dois são masculinos, então não é
  preciso flexão). O comportamento é idêntico.
- **Alternativas**: um componente `ListaClientes` copiado, recusado por duplicar código. Herança, que não existe
  em componentes React.

## R2. Tabela genérica por colunas

- **Decisão**: `Tabela<T extends {id: number}>` recebe colunas `{campo, rotulo, celula(item), className?}`.
  - O `campo` é a chave de ordenação enviada no `sort`.
  - O `className` mantém o layout de cartão no celular (`coluna-nome`, `coluna-email`).
- **Motivo**: o código de ordenação, `aria-sort` e cartões é o mesmo, e só as células mudam.

## R3. Hook de formulário

- **Decisão**: `useFormularioCadastro<F, D>` recebe:
  - `area` e `modo`;
  - `vazio(): F`;
  - `paraFormulario(d: D): F`;
  - `validar(f, modo)`;
  - `cadastrar(f)`;
  - `atualizar(original, f)`.

  Ele devolve `dados`, `atualizar(campo, valor)`, `valorDe`, `erros`, `erroGeral`, `enviando`, `enviar`,
  `formulario` (ref), `original` e `erroAoCarregar`. As funções `texto(...)` e `numerico(...)` passam a ser
  geradas pelo hook, para os dois formulários usarem.
- **Motivo**: tira da página de médico cerca de 150 linhas de comportamento, que passam a servir aos dois formulários.
- **Alternativas**: um formulário genérico dirigido por esquema de campos. É flexível demais para dois formulários
  e esconde a marcação, o que pesa contra a constituição IV ("cada linha explicável").

## R4. CPF

- **Decisão**: `dominio/cpf.ts` tem as funções:
  - `apenasDigitos(valor, 11)`;
  - `formatarCpf("52998224725")`, que devolve `"529.982.247-25"` e formata parcialmente enquanto se digita:
    `"5299"` vira `"529.9"`;
  - `cpfValido(digitos)`, que confere os dígitos verificadores com o mesmo algoritmo da `@CPF` e recusa os 11
    dígitos iguais.

  No formulário, o estado guarda só os dígitos. O `<input>` mostra `formatarCpf(valor)` e, no `onChange`, guarda
  `apenasDigitos(e.target.value)`. O cursor salta para o fim ao editar no meio, o que é aceitável num campo curto.
- **Motivo**: a máscara aparece sem biblioteca. Validar localmente evita uma ida ao servidor.
- **Alternativas**: `react-input-mask`, que contraria a constituição IV.

## R5. Data de nascimento

- **Decisão**: `<input type="date" max={ontem}>`. O valor já vem no formato `AAAA-MM-DD`.
  A validação local (`validarCliente`) recusa vazio e `>= hoje`, com "hoje" calculado na data local do navegador.
- **Motivo**: o seletor nativo é acessível e não precisa de biblioteca. O servidor roda no fuso de São Paulo, coerente com a clínica.

## R6. Rotas e o Spring

- **Decisão**: o `HomeController` mapeia `{"/", "/app", "/app/**"}` para `forward:/index.html`, mantendo o
  fallback que leva ao Swagger sem front compilado. No React, `/` e `/app` fazem `<Navigate replace to="/app/medicos">`.
  As rotas antigas saem dos dois lados.
- **Verificação**: `/app/**` não colide com recursos estáticos, que estão em `/assets/*` e `/favicon.svg`.

## R7. 404 neutro

- **Decisão**: em `api/cliente.ts`, o 404 passa a dizer "Não encontrado.". Nos erros de ação da `ListaCadastros`,
  `nao-encontrado` vira `` `${area.singularMaiusculo} não encontrado.` ``. O formulário já tem a tela própria de não encontrado.
