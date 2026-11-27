# Quickstart: Telas de clientes

## Testes

```bash
./mvnw test                  # inclui o RotasDaTelaTest com as rotas /app
cd frontend && npm test      # médicos (nas rotas novas) + clientes
cd frontend && npm run build # tipos + bundle (< 250 kB gzip)
```

## Verificação manual (banco separado, nunca no vollmed_api)

```bash
cd frontend && npm run build && cd ..
rm -rf src/main/resources/static && mkdir -p src/main/resources/static && cp -r frontend/dist/. src/main/resources/static/
DB_URL='jdbc:mysql://localhost/vollmed_e2e?createDatabaseIfNotExist=true' ./mvnw spring-boot:run
```

1. Abrir `/`, que leva a `/app/medicos`. O cabeçalho mostra **Médicos** ativo, e o seletor mostra **Ativos**.
2. Clicar em **Clientes**, que abre `/app/clientes`. O CPF aparece como `000.000.000-00`.
3. Clicar em **Novo cliente** e colar `529.982.247-25` no CPF. O campo mantém a pontuação.
4. Trocar o último dígito do CPF e salvar. O campo mostra "CPF inválido" e nada é enviado.
5. Escolher uma data futura e salvar. O campo mostra "deve ser uma data no passado".
6. Cadastrar um cliente válido. A tela volta com "Cliente cadastrado". Cadastrar de novo com o mesmo CPF, e o erro aparece no campo CPF.
7. Clicar em **Editar**. E-mail, CPF formatado e nascimento ficam bloqueados. Alterar o telefone e salvar, e aparece "Cliente atualizado".
8. Excluir com confirmação, ir em **Inativos**, reativar.
9. Abrir `/app/clientes/editar/99999`, que mostra "Cliente não encontrado". Apertar F5 em `/app/clientes/inativos?sort=cpf,desc`, e o estado se mantém.
10. Repetir o caminho de médicos nas rotas novas: lista, cadastro, edição e inativos.
11. Testar em 375px: tudo vira cartões, sem rolagem horizontal. Rodar o Lighthouse (acessibilidade) em `/app/clientes` e `/app/clientes/cadastro`.
