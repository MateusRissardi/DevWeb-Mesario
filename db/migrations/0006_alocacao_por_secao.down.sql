-- Reversão da migration 0006. Recria zona/seção/local em texto a partir da seção ligada.
begin;

drop index if exists public.convocacoes_alocacao_id_key;
create index convocacoes_alocacao_id_idx on public.convocacoes (alocacao_id);

drop index if exists public.alocacoes_secao_funcao_key;
drop index if exists public.alocacoes_secao_id_idx;
alter table public.alocacoes drop constraint if exists alocacoes_mesario_id_key;

alter table public.alocacoes
  add column zona_eleitoral integer,
  add column secao_eleitoral integer,
  add column local_votacao varchar;

update public.alocacoes a
   set zona_eleitoral = l.zona_eleitoral,
       secao_eleitoral = s.numero_secao,
       local_votacao = l.nome
  from public.secoes s
  join public.locais_votacao l on l.id = s.local_id
 where s.id = a.secao_id;

alter table public.alocacoes
  alter column zona_eleitoral set not null,
  alter column secao_eleitoral set not null,
  alter column local_votacao set not null,
  add constraint alocacoes_zona_secao_check
    check (zona_eleitoral > 0 and secao_eleitoral > 0),
  drop column secao_id;

create index alocacoes_mesario_id_idx on public.alocacoes (mesario_id);
create index alocacoes_zona_secao_idx on public.alocacoes (zona_eleitoral, secao_eleitoral);

alter table public.secoes
  drop constraint if exists secoes_local_numero_key,
  drop constraint if exists secoes_numero_positivo_check;
alter table public.locais_votacao
  drop constraint if exists locais_votacao_zona_nome_key,
  drop constraint if exists locais_votacao_zona_positiva_check;

commit;
