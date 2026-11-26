# Quickstart: Interface web de gestão de médicos

## Pré-requisitos

Java 17, Node 24 e npm. MySQL é opcional, porque dá para rodar com H2.

## Desenvolvimento (dois terminais)

```bash
# 1) API com H2 em memória (sem MySQL)
./mvnw spring-boot:run -Dspring-boot.run.profiles=test -Dspring-boot.run.useTestClasspath=true

# 2) Front com recarga automática
cd frontend
npm install
npm run dev      # http://localhost:5173 (as chamadas para /medicos vão para o :8080)
```

## Testes

```bash
./mvnw test                  # back-end, sem Node e sem MySQL
cd frontend && npm test      # front-end (Vitest)
cd frontend && npm run build # checagem de tipos e bundle de produção
```

## Como em produção (um `.jar`)

```bash
cd frontend && npm ci && npm run build && cd ..
rm -rf src/main/resources/static && mkdir -p src/main/resources/static
cp -r frontend/dist/. src/main/resources/static/
./mvnw spring-boot:run -Dspring-boot.run.profiles=test -Dspring-boot.run.useTestClasspath=true
# http://localhost:8080 serve a tela e a API juntas, como no portal
```

O `src/main/resources/static/` gerado não vai para o Git: ele está no `.gitignore`. No portal, quem
faz esse passo é o `Dockerfile`, e o perfil `prod` usa PostgreSQL.

## Roteiro de verificação manual

1. Abra `/`. A lista de ativos aparece, ordenada por nome (US1).
2. Clique em "Novo médico" e salve com o CRM "12". O erro aparece embaixo do campo CRM e nada é
   enviado (US2).
3. Cadastre um médico válido. A tela volta para a lista com o aviso "Médico cadastrado".
4. Cadastre outro médico com o mesmo CRM. O erro "Já existe um médico com este CRM…" aparece
   embaixo do campo (409).
5. Clique em "Editar". O formulário abre preenchido, com e-mail, CRM e especialidade bloqueados.
   Troque o telefone e salve (US3).
6. Acesse `/editar/99999`. A tela mostra "Médico não encontrado".
7. Exclua um médico, confirmando no modal. Ele aparece em "Inativos". Reative e confirme que
   voltou para os ativos (US4).
8. Aperte F5 em `/inativos?page=0&sort=crm,desc`. A tela e a ordenação se mantêm.
9. O link "Documentação da API" abre o Swagger (US5).
10. Teste em largura de 375px: a lista vira cartões e não há rolagem horizontal.
11. Rode o Lighthouse (acessibilidade) em `/`. Não pode haver violação grave.
