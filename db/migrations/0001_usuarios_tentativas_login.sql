-- Etapa 1 do backend: contas de acesso e controle de tentativas de login.
-- Cria duas tabelas novas. Não altera nem apaga nada do que já existe.
-- Reversão: 0001_usuarios_tentativas_login.down.sql

begin;

-- Contas de acesso (e-mail, hash bcrypt da senha e papel).
create table public.usuarios (
  id          integer generated always as identity primary key,
  email       varchar(254) not null,
  senha_hash  varchar(100) not null,
  papel       varchar(20)  not null,
  mesario_id  integer      references public.mesarios (id) on delete restrict,
  criado_em   timestamptz  not null default now(),
  constraint usuarios_papel_check
    check (papel in ('mesario', 'cartorio', 'administrador')),
  constraint usuarios_email_minusculo_check
    check (email = lower(email)),
  constraint usuarios_email_key unique (email),
  constraint usuarios_mesario_id_key unique (mesario_id)
);

comment on table  public.usuarios            is 'Contas de acesso ao portal.';
comment on column public.usuarios.senha_hash is 'Hash bcrypt. Nunca a senha em texto.';
comment on column public.usuarios.email      is 'Sempre em minúsculas; único.';
comment on column public.usuarios.mesario_id is 'Cadastro de mesário ligado à conta (opcional, no máximo uma conta por cadastro).';

-- Falhas de login, para bloquear temporariamente após várias tentativas seguidas.
create table public.tentativas_login (
  id         bigint generated always as identity primary key,
  email      varchar(254) not null,
  ip         varchar(45),
  criada_em  timestamptz  not null default now()
);

create index tentativas_login_email_criada_em_idx
  on public.tentativas_login (email, criada_em desc);
create index tentativas_login_ip_criada_em_idx
  on public.tentativas_login (ip, criada_em desc);

-- Mesmo padrão das demais tabelas: RLS ligado e sem políticas, para que a API
-- pública do Supabase não alcance estes dados. O servidor acessa por DATABASE_URL.
alter table public.usuarios         enable row level security;
alter table public.tentativas_login enable row level security;

revoke all on table public.usuarios, public.tentativas_login from anon, authenticated;
revoke all on sequence public.usuarios_id_seq, public.tentativas_login_id_seq from anon, authenticated;

commit;
