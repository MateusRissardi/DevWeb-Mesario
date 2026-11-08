-- Reversão da migration 0001. ATENÇÃO: apaga todas as contas criadas desde então.

begin;

drop table if exists public.tentativas_login;
drop table if exists public.usuarios;

commit;
