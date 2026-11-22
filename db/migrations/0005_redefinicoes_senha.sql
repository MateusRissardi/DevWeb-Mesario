-- "Esqueci minha senha": guarda os links de redefinição enviados por e-mail.
-- Só o HASH (SHA-256) do token é gravado; o token em si só existe no e-mail.
-- Cria 1 tabela nova; nenhuma tabela existente é alterada.
-- Reversão: 0005_redefinicoes_senha.down.sql

begin;

create table public.redefinicoes_senha (
  id          bigint generated always as identity primary key,
  usuario_id  integer     not null references public.usuarios (id) on delete cascade,
  token_hash  char(64)    not null,
  expira_em   timestamptz not null,
  usada_em    timestamptz,
  criada_em   timestamptz not null default now(),
  constraint redefinicoes_senha_token_hash_key unique (token_hash)
);

create index redefinicoes_senha_usuario_idx
  on public.redefinicoes_senha (usuario_id, criada_em desc);

comment on table public.redefinicoes_senha is
  'Links de redefinição de senha. Guarda só o hash do token; vale uma vez e expira.';

-- Mesmo padrão das demais tabelas: RLS ligado, sem políticas, sem acesso público.
alter table public.redefinicoes_senha enable row level security;
revoke all on table public.redefinicoes_senha from anon, authenticated;
revoke all on sequence public.redefinicoes_senha_id_seq from anon, authenticated;

commit;
