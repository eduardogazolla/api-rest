## Regras de Clean Code do projeto

> Use estas regras ao gerar ou revisar código deste projeto.

1. **Não duplicar lógica.** Se o mesmo trecho aparece em dois lugares, extraia um método com nome claro.
   Ex.: o `findById(...).orElseThrow(...)` repetido em `atualizar` e `excluir` virou `buscarMedicoPorId` no `MedicoService`. Antes, as mensagens já tinham ficado diferentes ("Medico" e "Médico").

2. **Nomes devem explicar a intenção.** Métodos começam com verbo e dizem o que fazem. Testes seguem o padrão `deve[Resultado]Quando[Condição]`.
   Ex.: `buscarMedicoPorId`, `atualizarInformacoes`, `deveLancarExcecaoAoExcluirMedicoInexistente`.

3. **Cada camada tem uma responsabilidade.** O Controller só recebe a requisição e repassa. O Service aplica as regras de negócio. O Repository só acessa o banco. O Controller nunca acessa o Repository direto.
   Ex.: cada método do `MedicoController` tem uma linha, que chama o `MedicoService`.

4. **Funções pequenas, que fazem uma coisa só.** Se for preciso usar "e" para descrever o método, ele deve ser dividido.
   Ex.: `excluir()` na `Medico` só marca o médico como inativo. Buscar o médico é responsabilidade do `buscarMedicoPorId`.

5. **Comentários só para explicar o porquê, nunca o óbvio.** O código deve se explicar sozinho. Comentário desatualizado deve ser removido, porque engana quem lê.
   Ex.: `// exclusão lógica: o registro é mantido no banco` explica uma decisão. Já `@Table(name = "medicos") // tabela "medico"` mentia sobre o nome da tabela.

6. **Sem código morto.** Remova imports sem uso, métodos que ninguém chama e código "para o futuro" que não tem uso nem teste.
   Ex.: o `import ...Mapper` e o método `Iterable<Long> id(Long id)` do `MedicoRepository`. O `ativar()` só ficou porque ganhou endpoint e testes.

7. **Erros devem ser explícitos e tratados.** Ao buscar um registro, use `findById(...).orElseThrow(...)` com uma mensagem clara. Exceções são traduzidas para o status HTTP correto num ponto central.
   Ex.: `EntityNotFoundException` é convertida em 404 pelo `TratadorDeErros`, em vez de virar erro 500.

8. **Dependências pelo construtor.** Use injeção pelo construtor com atributos `final`, nunca `@Autowired` no atributo. Isso deixa as dependências claras e facilita os testes com mock.
   Ex.: `MedicoService(MedicoRepository repository)`.

9. **Nenhum segredo no código.** Senhas, usuários e URLs de banco vêm de variáveis de ambiente.
   Ex.: `spring.datasource.password=${DB_PASSWORD:root}` no `application.properties`.

10. **Todo código novo vem com teste, e refatoração só com testes verdes.** Cada funcionalidade precisa de pelo menos um cenário positivo e um de exceção. Antes e depois de refatorar, todos os testes devem passar.
    Ex.: `ativar` tem `deveReativarMedicoInativo` e `deveLancarExcecaoAoAtivarMedicoInexistente` no `MedicoServiceTest`.