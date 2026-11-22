-- Reversão da migration 0005. Apaga os links de redefinição pendentes.
begin;
drop table if exists public.redefinicoes_senha;
commit;
