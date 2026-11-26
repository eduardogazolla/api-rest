# Telas de clientes na Voll.med: design

Data: 26/11/2026 · Branch: `pdi/clientes-frontend`

## 1. Intenção e porquê

O back-end de clientes (pacientes) entrou no PR #13. Antes de publicar no Portal DB1, o Eduardo quer que a
equipe da clínica consiga gerenciar clientes pela interface, **do mesmo jeito que já gerencia médicos**:
listar ativos e inativos, cadastrar, editar, excluir e reativar.

Como é PDI, vale a mesma regra das entregas anteriores: código explicável, testes antes do código, sem
duplicação (`Rules.md`) e de acordo com a constituição (`.specify/memory/constitution.md`).

## 2. Objetivos, não-objetivos e anti-objetivos

**Objetivos**
- Telas de clientes equivalentes às de médicos:
  - lista de ativos com paginação e ordenação na URL;
  - inativos com o botão Reativar;
  - cadastro com validação local e erros do servidor no campo;
  - edição pré-preenchida, com campos de identidade bloqueados;
  - exclusão com confirmação.
- Navegação clara entre Médicos e Clientes.
- Separação de rotas por uma regra única: **tudo que começa com `/app` é tela, o resto é API**.

**Não-objetivos**
- Mudar a API: nenhum endpoint ou contrato muda.
- Agendamento de consultas ou vínculo entre médico e cliente.
- Busca por nome ou CPF.
- Manter os endereços antigos das telas de médico (`/inativos`, `/cadastro`, `/editar/{id}`). Ver decisão D3.

**Anti-objetivos (seria um fracasso mesmo funcionando)**
- Copiar e colar `ListaMedicos` e `FormularioMedico` para clientes. A duplicação viola a regra 1 do `Rules.md`, e uma
  correção futura teria de ser feita duas vezes.
- Quebrar as telas de médicos ou os 73 testes atuais do front, exceto o que muda de rota de propósito.
- Mostrar CPF sem pontuação na tela ("52998224725" é ilegível para quem atende).

## 3. Restrições

- A API de clientes já existe (`specs/002-clientes-backend/contracts/api-clientes.md`):
  - a listagem devolve `{id, nome, email, cpf}`;
  - o detalhe devolve também `telefone`, `dataNascimento` (`AAAA-MM-DD`), `endereco` e `ativo`;
  - o `PUT` aceita só `nome`, `telefone` e `endereco`;
  - os erros vêm em `[{campo, mensagem}]`, com 400 e 409, e o 409 de CPF aparece no campo `cpf`.
- Stack do front: React 19, TypeScript, Vite e React Router, sem bibliotecas novas (constituição IV).
- O `mvn test` continua sem Node, e o `npm test` cobre o front.
- O mesmo `.jar` serve a tela e a API, e o Swagger continua em `/swagger-ui/index.html`.

## 4. Abordagens consideradas (para as rotas)

| | Rotas de tela | Trade-off |
|---|---|---|
| A | clientes em `/pacientes/...`, médicos onde estão | É a menor, mas a URL diz "pacientes" e a tela diz "Clientes" |
| **B ✅ (escolhida)** | todas as telas em `/app`: `/app/medicos/...` e `/app/clientes/...`, e `/` leva para `/app/medicos` | Fica uma regra simples. Mudam as URLs de tela dos médicos, **a API não muda** |
| C | API em `/api/...`, com as telas ocupando `/medicos` e `/clientes` | As URLs ficam no padrão de mercado, mas quebra o contrato da API (constituição V), o Swagger e os testes |

O Eduardo escolheu a **B**.

## 5. Desenho

### D1. Rotas de tela

| Tela | Rota |
|---|---|
| Médicos ativos | `/app/medicos` |
| Médicos inativos | `/app/medicos/inativos` |
| Novo médico | `/app/medicos/cadastro` |
| Editar médico | `/app/medicos/editar/:id` |
| Clientes ativos | `/app/clientes` |
| Clientes inativos | `/app/clientes/inativos` |
| Novo cliente | `/app/clientes/cadastro` |
| Editar cliente | `/app/clientes/editar/:id` |
| Raiz | `/` redireciona para `/app/medicos` |

- **Spring** (`HomeController`): encaminha `/`, `/app` e `/app/**` para `index.html`, para F5 e link direto
  funcionarem. Mantém o fallback que leva ao Swagger quando o front não foi compilado.
- **Constituição V**: a frase "rotas de tela MUST NOT começar com `/medicos`" passa a dizer "as rotas de tela
  ficam em `/app`, e `/medicos` e `/clientes` são da API". É uma emenda PATCH, de redação, porque a intenção não muda.

### D2. Navegação

```
[+ Voll.med]   Médicos   Clientes                    Documentação da API
─────────────────────────────────────────────────────────────────────────
Clientes                                              [Novo cliente]
128 clientes        ( Ativos | Inativos )

Nome ↑            E-mail                    CPF
Beatriz Rocha     beatriz.rocha@...         529.982.247-25    Editar  Excluir
```

- **Cabeçalho**: "Médicos" e "Clientes". O item fica ativo para qualquer rota daquela seção, incluindo cadastro e edição.
- **Dentro de cada seção**: um seletor "Ativos | Inativos" logo abaixo do título, que troca entre a lista e os inativos.
  Ele substitui o link "Inativos" que hoje fica no cabeçalho.
- **Título**: "Médicos" ou "Clientes", com o seletor indicando a situação. A contagem continua.

### D3. Endereços antigos de médico

Só a raiz `/` redireciona. `/inativos`, `/cadastro` e `/editar/{id}` deixam de existir e mostram a tela
"Página não encontrada", que tem o link para médicos.
- **Motivo**: o app foi publicado há dias para duas pessoas nomeadas, então o risco de um link guardado é mínimo e
  manter rotas de compatibilidade seria código "para o futuro".
- **No Spring**: essas rotas antigas deixam de ser encaminhadas e voltam a dar o 404 do servidor. É aceitável,
  e fica registrado.

### D4. Reuso sem duplicar

| O que | Hoje | Passa a ser |
|---|---|---|
| Estado da lista: página e sort na URL, carregar, erro, vazio, voltar uma página ao excluir o último, aviso e modal de exclusão | dentro de `ListaMedicos` | Uma página genérica de lista, parametrizada por: funções da API (listar ativos e inativos, excluir, reativar), textos (singular, plural, "Novo cliente") e a tabela da entidade. `ListaMedicos` e `ListaClientes` ficam finos. |
| Tabela | `TabelaMedicos`, com colunas fixas | Uma tabela genérica que recebe as definições de coluna (rótulo, campo de ordenação e como renderizar). As colunas de médico e de cliente ficam cada uma no seu arquivo. |
| Formulário | `FormularioMedico` (306 linhas), que mistura o comportamento de envio e erros com os campos | O comportamento comum (carregar na edição, validar, enviar, mapear erros por campo, foco no primeiro erro, aviso, 404) vira um hook reutilizável. O bloco **Endereço** vira um componente compartilhado. Cada formulário fica só com os seus campos. |
| Cliente HTTP (`api/cliente.ts`) | o 404 diz "Médico não encontrado." para qualquer recurso | A mensagem do 404 fica neutra ("Não encontrado."), e a lista e o formulário genéricos mostram a mensagem da entidade ("Médico não encontrado", "Cliente não encontrado"). Os textos que a pessoa vê nas telas de médico não mudam. |
| `Campo`, `Paginacao`, `ModalConfirmacao`, `Aviso` | genéricos | sem mudança |

Os nomes exatos ficam com quem implementa. A regra é que nenhum comportamento seja escrito duas vezes.

### D5. Telas de cliente

- **Lista**: colunas **Nome**, **E-mail** e **CPF** (formatado `000.000.000-00`), com ordenação nas três.
  Ações: Editar e Excluir (ativos) ou Reativar (inativos).
- **Formulário** com dois grupos:
  - **Dados do cliente**: Nome, E-mail, Telefone, **CPF** e **Data de nascimento**;
  - **Endereço**: o mesmo bloco dos médicos.
- **CPF**:
  - o campo **mostra a máscara** `000.000.000-00` enquanto se digita e quando está bloqueado na edição. A tela
    nunca mostra o CPF sem pontuação (anti-objetivo);
  - aceita digitar ou colar com ou sem pontuação, e o valor guardado e enviado é só os 11 dígitos;
  - o formatador é o mesmo da coluna CPF da lista;
  - a validação local confere 11 dígitos e os **dígitos verificadores**, com as mesmas mensagens do servidor:
    "deve ter 11 dígitos, sem pontuação" e "CPF inválido".
- **Data de nascimento**:
  - usa `<input type="date">`, que já manda o valor no formato `AAAA-MM-DD`, com `max` igual a ontem;
  - a validação local recusa data vazia ("é obrigatório") e data de hoje ou futura ("deve ser uma data no passado").
- **Edição**:
  - e-mail, CPF e data de nascimento ficam bloqueados, com a dica "Não pode ser alterado";
  - o `PUT` envia só o que mudou (nome, telefone e endereço), como nos médicos.
- **Erros do servidor**: o 409 de CPF aparece no campo CPF e o de e-mail no campo E-mail.
- **Textos**:
  - avisos: "Cliente cadastrado", "Cliente atualizado", "Cliente excluído" e "Cliente reativado";
  - estado vazio: "Nenhum cliente ativo", com o atalho "Cadastrar o primeiro cliente";
  - não encontrado: "Cliente não encontrado".

### D6. Testes

- Os testes atuais de médicos continuam valendo e são ajustados só nas rotas e nos títulos que mudam.
- Clientes ganham os mesmos cenários dos médicos:
  - lista: ordenação, paginação, vazio, página além do fim, sort inválido, rede, sessão, exclusão com confirmação, voltar uma página e inativos com reativar;
  - formulário: validação local, 409 de CPF no campo, sucesso com aviso, duplo clique, edição pré-preenchida com campos bloqueados, só o que mudou no `PUT` e 404.
- Novos testes:
  - CPF: formatação e validação de dígitos;
  - data de nascimento no futuro;
  - navegação: cabeçalho e seletor Ativos/Inativos;
  - `/` redireciona para `/app/medicos`.
- No Spring, o `RotasDaTelaTest` passa a cobrir `/app/medicos`, `/app/clientes/editar/7` e assim por diante.
- Ao final:
  - Playwright contra o `.jar` com o front, no banco `vollmed_e2e`;
  - Lighthouse de acessibilidade em `/app/clientes` e `/app/clientes/cadastro`.

### D7. Fluxo de trabalho

Igual às entregas anteriores:
1. Spec Kit: `specs/003-clientes-frontend/` com spec, plano e tarefas.
2. Implementação por fase, com TDD e um commit por fase.
3. `/code-review high`.
4. PR sem atribuição do Claude.

O deploy no portal vem depois do merge e precisa da resposta sobre o fator `dado_sensivel` (CPF).

## 6. Decisões minhas (Claude), para o Eduardo revisar

- Seletor "Ativos | Inativos" dentro de cada seção, e não um item de cabeçalho para cada lista.
- Endereços antigos de médico sem redirecionamento (D3).
- CPF exibido com pontuação e digitado com ou sem ela.
- Data de nascimento com o seletor de data nativo do navegador.
- Lista e formulário genéricos com as partes específicas por entidade (D4).
- O campo CPF com máscara visível. O valor enviado é só de dígitos.
- A mensagem do 404 neutra no cliente HTTP. O texto de cada entidade fica na tela.
- `/clientes` entra no proxy do Vite, e `/app` sem sub-rota vai para `/app/medicos`.
- A constituição vai para 1.0.1, com a redação da regra de rotas.

## 7. Fica com quem implementa

- Nomes de componentes, hooks e arquivos, em português e seguindo o padrão atual.
- O formato exato da definição de colunas e da configuração da lista genérica.
- O estilo visual do seletor Ativos/Inativos, dentro dos tokens existentes.
