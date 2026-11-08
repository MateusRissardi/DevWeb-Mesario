-- Reversão da migration 0002. ATENÇÃO: apaga alocações e convocações registradas desde então.
-- O `grant execute` final devolve o estado anterior da função (executável por todos).

begin;

drop table if exists public.convocacoes;
drop table if exists public.alocacoes;

alter table public.mesarios
  drop constraint if exists mesarios_cpf_formato_check,
  drop constraint if exists mesarios_titulo_formato_check,
  drop constraint if exists mesarios_zona_secao_check;

grant execute on function public.rls_auto_enable() to public, anon, authenticated;

commit;
