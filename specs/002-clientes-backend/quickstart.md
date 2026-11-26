# Quickstart: Cadastro de clientes

## Testes automatizados

```bash
./mvnw test                # tudo verde, sem MySQL (H2 com a migration V4 MySQL)
cd frontend && npm test    # o front não muda; continua verde
```

## Verificação manual (banco separado, nunca no vollmed_api)

```bash
DB_URL='jdbc:mysql://localhost/vollmed_e2e?createDatabaseIfNotExist=true' ./mvnw spring-boot:run
```

Abra `http://localhost:8080/swagger-ui/index.html`. Deve aparecer o grupo **Clientes** com 7 operações.
Ver o contrato completo em [contracts/api-clientes.md](./contracts/api-clientes.md).

1. Fazer `POST /clientes` com o exemplo do contrato, que deve dar 200. Repetir o mesmo `POST`, que deve dar 409 com `campo: "cpf"`.
2. Fazer `POST` com `cpf: "52998224724"`, que deve dar 400 com "CPF inválido". Depois com `dataNascimento` no futuro, que deve dar 400.
3. Fazer `POST` com `dataNascimento: "31/02/1990"`, que deve dar 400 com `campo: "dataNascimento"`.
4. Chamar `GET /clientes`, que deve listar o cliente. Depois `GET /clientes?sort=xyz`, que deve dar 400.
5. Chamar `GET /clientes/{id}`, que deve trazer o detalhe com `dataNascimento` e `ativo: true`. Depois `GET /clientes/99999`, que deve dar 404.
6. Fazer `PUT /clientes` com `{id, telefone}`. O telefone muda e o resto permanece.
7. Fazer `DELETE /clientes/{id}`. O cliente some de `GET /clientes` e aparece em `GET /clientes/inativos`. Depois `PATCH /clientes/{id}/ativar` o devolve aos ativos.
8. Conferir que `/medicos` continua respondendo como antes.
