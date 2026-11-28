BEGIN;

DROP TABLE IF EXISTS public.pendencias;
DROP TABLE IF EXISTS public.historico_eventos;

ALTER TABLE public.alocacoes
  DROP CONSTRAINT IF EXISTS alocacoes_situacao_check,
  DROP COLUMN IF EXISTS confirmada_por,
  DROP COLUMN IF EXISTS confirmada_em,
  DROP COLUMN IF EXISTS situacao;

ALTER TABLE public.mesarios
  DROP CONSTRAINT IF EXISTS mesarios_origem_check,
  DROP CONSTRAINT IF EXISTS mesarios_situacao_analise_check,
  DROP COLUMN IF EXISTS telefone_whatsapp,
  DROP COLUMN IF EXISTS origem,
  DROP COLUMN IF EXISTS situacao_analise;

COMMIT;
