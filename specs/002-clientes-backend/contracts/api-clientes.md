# Contrato HTTP: clientes

Tem os mesmos formatos de `/medicos` (ver `specs/001-frontend-medicos/contracts/api-medicos.md`).

## Erros

| Status | Quando | Corpo |
|---|---|---|
| 400 | validação | `[{"campo":"cpf","mensagem":"CPF inválido"}]` |
| 400 | JSON ilegível | `[{"campo":"dataNascimento","mensagem":"formato inválido"}]`, ou `campo: null` quando não dá para identificar |
| 400 | sort inválido | `{"mensagem":"Parâmetro sort inválido. Use um campo da listagem, por exemplo: nome ou nome,desc"}` |
| 404 | id inexistente | vazio |
| 409 | CPF ou e-mail repetido (mesmo de inativo) | `[{"campo":"cpf","mensagem":"Já existe um cliente com este CPF (ele pode estar inativo)."}]` |

## Endpoints

| Método | Rota | Corpo / parâmetros | Sucesso |
|---|---|---|---|
| POST | `/clientes` | `{nome, email, telefone, cpf, dataNascimento, endereco}` | 200, sem corpo |
| GET | `/clientes` | `page`, `size`, `sort` (padrão `size=10`, `sort=nome`) | 200, `Page<{id, nome, email, cpf}>` (só ativos) |
| GET | `/clientes/inativos` | iguais | 200, só inativos |
| GET | `/clientes/{id}` | – | 200, `{id, nome, email, telefone, cpf, dataNascimento, endereco, ativo}` |
| PUT | `/clientes` | `{id, nome?, telefone?, endereco?}` (parcial) | 200 |
| DELETE | `/clientes/{id}` | – | 200 (inativa) |
| PATCH | `/clientes/{id}/ativar` | – | 200 |

Exemplo de cadastro:

```json
{"nome":"Beatriz Rocha","email":"beatriz.rocha@exemplo.com","telefone":"44999998888",
 "cpf":"52998224725","dataNascimento":"1990-05-20",
 "endereco":{"logradouro":"Av. Brasil","bairro":"Centro","cep":"87013000","cidade":"Maringá","uf":"PR","numero":"100"}}
```

(`52998224725` é um CPF de teste com dígitos válidos, muito usado em exemplos. Não pertence a ninguém da clínica.)

## Médicos

Os contratos não mudam. Mudam só dois textos: a mensagem de sort inválido e a de "já existe … com estes
dados", que passam a ser genéricas. O handler de JSON ilegível também passa a valer para `/medicos`.
