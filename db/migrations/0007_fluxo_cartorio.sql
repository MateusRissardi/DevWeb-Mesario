-- 0007: fluxo completo do cartório (manifestações, pendências persistentes, seleção em duas etapas).
-- Seguro para reaplicar: não aborta com dados existentes (só acrescenta colunas e tabelas).

BEGIN;

-- Manifestação: situação de análise, origem e se o telefone tem WhatsApp.
ALTER TABLE public.mesarios
  ADD COLUMN situacao_analise varchar(20) NOT NULL DEFAULT 'nova',
  ADD COLUMN origem varchar(20) NOT NULL DEFAULT 'portal',
  ADD COLUMN telefone_whatsapp boolean NOT NULL DEFAULT false;

ALTER TABLE public.mesarios
  ADD CONSTRAINT mesarios_situacao_analise_check
    CHECK (situacao_analise IN ('nova', 'em_analise', 'apta')),
  ADD CONSTRAINT mesarios_origem_check
    CHECK (origem IN ('portal', 'presencial'));

-- Cadastros já existentes sem conta de acesso foram feitos pelo cartório.
UPDATE public.mesarios m SET origem = 'presencial'
 WHERE NOT EXISTS (SELECT 1 FROM public.usuarios u WHERE u.mesario_id = m.id);

-- Seleção em duas etapas: pré-selecionado -> selecionado (confirmação do cartório).
ALTER TABLE public.alocacoes
  ADD COLUMN situacao varchar(20) NOT NULL DEFAULT 'pre_selecionado',
  ADD COLUMN confirmada_em timestamptz,
  ADD COLUMN confirmada_por integer REFERENCES public.usuarios(id) ON DELETE SET NULL;

ALTER TABLE public.alocacoes
  ADD CONSTRAINT alocacoes_situacao_check
    CHECK (situacao IN ('pre_selecionado', 'selecionado'));

-- Histórico de ações (manifestação, pendência, seção).
CREATE TABLE public.historico_eventos (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entidade varchar(20) NOT NULL CHECK (entidade IN ('manifestacao', 'pendencia', 'secao')),
  entidade_id integer NOT NULL,
  texto varchar(300) NOT NULL,
  usuario_id integer REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX historico_eventos_entidade_idx
  ON public.historico_eventos (entidade, entidade_id, criado_em DESC);

-- Pendências persistentes. As automáticas são abertas e encerradas pelo sistema.
CREATE TABLE public.pendencias (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tipo varchar(30) NOT NULL CHECK (tipo IN (
    'secao_incompleta', 'possivel_impedimento', 'falha_contato',
    'interesse_retirado', 'dados_incompletos', 'sem_alocacao')),
  prioridade varchar(20) NOT NULL CHECK (prioridade IN ('critica', 'atencao', 'informativa')),
  status varchar(20) NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_analise', 'resolvida')),
  mesario_id integer REFERENCES public.mesarios(id) ON DELETE CASCADE,
  secao_id integer REFERENCES public.secoes(id) ON DELETE CASCADE,
  contexto varchar(300) NOT NULL,
  responsavel_id integer REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criada_em timestamptz NOT NULL DEFAULT now(),
  atualizada_em timestamptz NOT NULL DEFAULT now(),
  resolvida_em timestamptz,
  resolvida_por integer REFERENCES public.usuarios(id) ON DELETE SET NULL,
  CHECK (mesario_id IS NOT NULL OR secao_id IS NOT NULL)
);

-- No máximo uma pendência não resolvida por tipo e alvo (guarda contra duplicidade e corrida).
CREATE UNIQUE INDEX pendencias_aberta_unica
  ON public.pendencias (tipo, (COALESCE(mesario_id, 0)), (COALESCE(secao_id, 0)))
  WHERE status <> 'resolvida';
CREATE INDEX pendencias_status_idx ON public.pendencias (status, prioridade);
CREATE INDEX pendencias_mesario_idx ON public.pendencias (mesario_id);
CREATE INDEX pendencias_secao_idx ON public.pendencias (secao_id);

-- Mesmo padrão das demais tabelas: só o servidor (conexão direta) acessa.
ALTER TABLE public.historico_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendencias ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.historico_eventos, public.pendencias FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.historico_eventos_id_seq, public.pendencias_id_seq FROM anon, authenticated;

COMMIT;
