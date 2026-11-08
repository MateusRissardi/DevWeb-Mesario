# Migrations

Arquivos SQL numerados, aplicados em ordem. Cada migration tem um arquivo de reversão (`.down.sql`).

Procedimento (o banco do projeto é só o de produção):

1. Exportar o backup (CSV) das tabelas afetadas.
2. Revisar o SQL da migration.
3. Aplicar com autorização expressa, uma migration por vez.
4. Conferir o resultado com as consultas de verificação do relatório da etapa.

| Migration | O que faz |
| --- | --- |
| `0001_usuarios_tentativas_login` | Cria `usuarios` e `tentativas_login` |
| `0002_alocacoes_convocacoes_restricoes` | Cria `alocacoes` e `convocacoes`; acrescenta CHECKs em `mesarios`; revoga `rls_auto_enable()` de anon/authenticated |
