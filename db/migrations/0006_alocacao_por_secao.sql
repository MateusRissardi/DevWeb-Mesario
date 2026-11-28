-- Alocação ligada às tabelas de locais e seções (em vez de zona/seção/local em texto).
-- Também garante unicidade: um local por zona+nome, uma seção por local+número,
-- um voluntário só em uma alocação, uma função (exceto suplente) por seção,
-- e uma convocação por alocação.
-- Exige que public.alocacoes esteja vazia (a migration aborta se não estiver).
-- Reversão: 0006_alocacao_por_secao.down.sql

begin;

do $$
begin
  if exists (select 1 from public.alocacoes) then
    raise exception 'public.alocacoes tem linhas; migre os dados antes de aplicar a 0006';
  end if;
end $$;

-- Locais e seções
alter table public.locais_votacao
  add constraint locais_votacao_zona_positiva_check check (zona_eleitoral > 0),
  add constraint locais_votacao_zona_nome_key unique (zona_eleitoral, nome);

alter table public.secoes
  add constraint secoes_numero_positivo_check check (numero_secao > 0),
  add constraint secoes_local_numero_key unique (local_id, numero_secao);

-- Alocações
drop index if exists public.alocacoes_zona_secao_idx;
drop index if exists public.alocacoes_mesario_id_idx;

alter table public.alocacoes
  add column secao_id integer not null
    references public.secoes (id) on delete restrict,
  drop column zona_eleitoral,
  drop column secao_eleitoral,
  drop column local_votacao;

alter table public.alocacoes
  add constraint alocacoes_mesario_id_key unique (mesario_id);

create index alocacoes_secao_id_idx on public.alocacoes (secao_id);

-- Cada função (menos suplente) tem uma pessoa só por seção.
create unique index alocacoes_secao_funcao_key
  on public.alocacoes (secao_id, funcao)
  where funcao <> 'suplente';

-- Uma convocação por alocação.
create unique index convocacoes_alocacao_id_key
  on public.convocacoes (alocacao_id)
  where alocacao_id is not null;

drop index if exists public.convocacoes_alocacao_id_idx;

commit;
