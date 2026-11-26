# Contrato HTTP: médicos

Os endpoints **existentes** mantêm o método, o caminho, o corpo de entrada e o corpo de sucesso.
O que muda está marcado como ➕ novo ou ✏️ alterado.

## Formatos de erro

| Status | Quando | Corpo |
|---|---|---|
| 400 | Bean Validation falhou ✏️ | `[{"campo":"endereco.cep","mensagem":"deve ter 8 dígitos, sem traço"}]` |
| 400 | sort inválido (inalterado) | `{"mensagem":"Parâmetro sort inválido. ..."}` |
| 404 | id inexistente (inalterado) | vazio |
| 409 | e-mail ou CRM duplicado ➕ | `[{"campo":"crm","mensagem":"Já existe um médico com este CRM (ele pode estar inativo)."}]` |
| 409 | violação de integridade sem campo identificável ➕ | `[{"campo":null,"mensagem":"Já existe um médico com estes dados."}]` |

## `GET /medicos/{id}` ➕

- 200:
  ```json
  {"id":1,"nome":"Ana Souza","email":"ana@voll.med","telefone":"44999990000","crm":"123456",
   "especialidade":"CARDIOLOGIA",
   "endereco":{"logradouro":"Rua das Flores","bairro":"Centro","cep":"87000000","cidade":"Maringá",
               "uf":"PR","complemento":null,"numero":"100"},
   "ativo":true}
  ```
- Também devolve médicos inativos, com `"ativo": false`.
- 404 se o id não existir.

## `GET /medicos/inativos` ➕

- Mesmos parâmetros de `GET /medicos`: `page`, `size` e `sort`. O padrão é `size=10`,
  `sort=nome`.
- 200: `Page<DadosListagemMedico>`, só com os inativos.
- 400 se o sort for inválido, no formato `{mensagem}`.

## `POST /medicos` ✏️

- A entrada e o 200 sem corpo não mudam.
- Novo: 409 quando o CRM ou o e-mail já existir, em qualquer médico. O CRM é checado primeiro.
- Novo: o 400 passa a ter o corpo `[{campo, mensagem}]`. Antes era o corpo padrão do Spring.

## `PUT /medicos` ✏️

- A entrada não muda (`id`, `nome?`, `telefone?`, `endereco?`).
- Novo: dentro de `endereco`, os campos enviados são validados. Logradouro, bairro, cidade e UF
  não podem estar em branco, e o CEP precisa ter 8 dígitos. Com erro, a resposta é 400 no
  formato `[{campo, mensagem}]`.
- `numero` e `complemento` igual a `""` apagam o valor.

## Inalterados

`GET /medicos`, `DELETE /medicos/{id}`, `PATCH /medicos/{id}/ativar`, `GET /health`, `/swagger-ui/**`, `/v3/api-docs`.

## Rotas de tela (não são API)

`GET /`, `/inativos`, `/cadastro` e `/editar/{id}` devolvem o `index.html` da SPA (forward).
