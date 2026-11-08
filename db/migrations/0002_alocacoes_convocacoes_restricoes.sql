-- Etapa 5 do backend: alocações, convocações, restrições de integridade e fechamento
-- de uma função exposta. Cria 2 tabelas novas; em `mesarios` só ACRESCENTA restrições
-- e índices (nenhum dado é alterado ou apagado).
-- Reversão: 0002_alocacoes_convocacoes_restricoes.down.sql
--
-- Pré-condição verificada em produção (somente leitura): o único cadastro existente
-- atende a todas as restrições novas de `mesarios`.

begin;

-- 1) Restrições de formato em `mesarios` (a API já valida; o banco passa a garantir).
alter table public.mesarios
  add constraint mesarios_cpf_formato_check
    check (cpf ~ '^[0-9]{11}$'),
  add constraint mesarios_titulo_formato_check
    check (titulo_eleitor ~ '^[0-9]{12}$'),
  add constraint mesarios_zona_secao_check
    check (zona_eleitoral > 0 and secao_eleitoral > 0);

-- 2) Alocações: onde e em que função o mesário atuará.
create table public.alocacoes (
  id              integer generated always as identity primary key,
  mesario_id      integer      not null references public.mesarios (id) on delete restrict,
  zona_eleitoral  integer      not null,
  secao_eleitoral integer      not null,
  local_votacao   varchar(200) not null,
  funcao          varchar(30)  not null,
  criado_em       timestamptz  not null default now(),
  constraint alocacoes_zona_secao_check check (zona_eleitoral > 0 and secao_eleitoral > 0),
  constraint alocacoes_funcao_check
    check (funcao in ('presidente', 'primeiro_mesario', 'segundo_mesario', 'secretario', 'suplente'))
);

create index alocacoes_mesario_id_idx on public.alocacoes (mesario_id);
create index alocacoes_zona_secao_idx on public.alocacoes (zona_eleitoral, secao_eleitoral);

comment on table public.alocacoes is 'Alocação de mesários em zona/seção com uma função.';

-- 3) Convocações: registro manual do status. Nenhuma mensagem é enviada pelo sistema.
create table public.convocacoes (
  id              integer generated always as identity primary key,
  mesario_id      integer      not null references public.mesarios (id) on delete restrict,
  alocacao_id     integer      references public.alocacoes (id) on delete set null,
  status          varchar(20)  not null default 'pendente',
  observacao      varchar(500),
  registrado_por  integer      references public.usuarios (id) on delete set null,
  criada_em       timestamptz  not null default now(),
  atualizada_em   timestamptz  not null default now(),
  constraint convocacoes_status_check
    check (status in ('pendente', 'convocado', 'confirmado', 'recusado', 'cancelado'))
);

create index convocacoes_mesario_id_idx   on public.convocacoes (mesario_id);
create index convocacoes_alocacao_id_idx  on public.convocacoes (alocacao_id);
create index convocacoes_status_idx       on public.convocacoes (status);
create index convocacoes_registrado_por_idx on public.convocacoes (registrado_por);

comment on table  public.convocacoes        is 'Status manual das convocações (sem envio de mensagens).';
comment on column public.convocacoes.status is 'pendente, convocado, confirmado, recusado ou cancelado.';

-- 4) Mesmo padrão das demais tabelas: RLS ligado, sem políticas, sem acesso público.
alter table public.alocacoes  enable row level security;
alter table public.convocacoes enable row level security;

revoke all on table public.alocacoes, public.convocacoes from anon, authenticated;
revoke all on sequence public.alocacoes_id_seq, public.convocacoes_id_seq from anon, authenticated;

-- 5) rls_auto_enable() não deve ser chamável pela API pública do Supabase.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

commit;
