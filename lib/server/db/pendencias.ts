import pool from "@/lib/db";
import { VAGAS_POR_SECAO } from "@/lib/server/validation/cartorio";

import { listarEventos, registrarEvento, type Evento } from "./eventos";

export type TipoPendencia =
  | "secao_incompleta"
  | "possivel_impedimento"
  | "falha_contato"
  | "interesse_retirado"
  | "dados_incompletos"
  | "sem_alocacao";
export type Prioridade = "critica" | "atencao" | "informativa";
export type StatusPendencia = "aberta" | "em_analise" | "resolvida";

export const TITULO_PENDENCIA: Record<TipoPendencia, string> = {
  secao_incompleta: "Seção incompleta",
  possivel_impedimento: "Possível impedimento",
  falha_contato: "Falha de contato",
  interesse_retirado: "Interesse retirado",
  dados_incompletos: "Dados incompletos",
  sem_alocacao: "Sem local e seção",
};

/** Só este tipo é aberto e encerrado por uma pessoa; os outros seguem a situação real. */
const TIPO_MANUAL: TipoPendencia = "possivel_impedimento";

/**
 * Situações que o sistema detecta sozinho. Cada linha é uma pendência que deve
 * existir agora; a sincronização abre as que faltam e encerra as que não valem mais.
 */
const ALVOS = `
alvo AS (
  SELECT 'dados_incompletos'::text AS tipo,
         CASE WHEN a.id IS NOT NULL THEN 'critica' ELSE 'atencao' END AS prioridade,
         m.id AS mesario_id, NULL::int AS secao_id,
         CASE WHEN m.email IS NULL OR btrim(m.email) = '' THEN 'Sem telefone e sem e-mail'
              ELSE 'Sem telefone' END
           || CASE WHEN a.id IS NOT NULL THEN ' · já pré-selecionado, não dá para convocar' ELSE '' END AS contexto
    FROM mesarios m
    LEFT JOIN alocacoes a ON a.mesario_id = m.id
   WHERE COALESCE(m.status_interesse, true)
     AND (m.telefone IS NULL OR btrim(m.telefone) = '')
  UNION ALL
  SELECT 'sem_alocacao', 'informativa', m.id, NULL,
         'Interesse ativo, ainda sem local e seção definidos'
    FROM mesarios m
   WHERE COALESCE(m.status_interesse, true)
     AND NOT EXISTS (SELECT 1 FROM alocacoes a WHERE a.mesario_id = m.id)
  UNION ALL
  SELECT 'interesse_retirado', 'informativa', m.id, a.secao_id,
         'Seleção vinculada · Seção ' || s.numero_secao
    FROM mesarios m
    JOIN alocacoes a ON a.mesario_id = m.id
    JOIN secoes s ON s.id = a.secao_id
   WHERE NOT COALESCE(m.status_interesse, true)
  UNION ALL
  SELECT 'falha_contato', 'atencao', c.mesario_id, a.secao_id,
         'Convocação recusada · Seção ' || s.numero_secao
    FROM convocacoes c
    JOIN alocacoes a ON a.id = c.alocacao_id
    JOIN secoes s ON s.id = a.secao_id
   WHERE c.status = 'recusado'
  UNION ALL
  SELECT 'secao_incompleta',
         CASE WHEN NOT bool_or(a.funcao = 'presidente') THEN 'critica' ELSE 'atencao' END,
         NULL, s.id,
         CASE WHEN NOT bool_or(a.funcao = 'presidente') THEN 'Presidente sem responsável'
              ELSE (${VAGAS_POR_SECAO} - count(*))::text || ' vaga(s) aberta(s) na mesa' END
    FROM secoes s
    JOIN alocacoes a ON a.secao_id = s.id AND a.funcao <> 'suplente'
   GROUP BY s.id
  HAVING count(*) < ${VAGAS_POR_SECAO}
)`;

const MESMO_ALVO = `
  a.tipo = p.tipo
  AND COALESCE(a.mesario_id, 0) = COALESCE(p.mesario_id, 0)
  AND COALESCE(a.secao_id, 0) = COALESCE(p.secao_id, 0)`;

/**
 * Abre as pendências automáticas que faltam, atualiza prioridade/contexto das
 * abertas e encerra as que deixaram de valer. Idempotente; o bloqueio impede
 * que duas execuções simultâneas se atropelem.
 */
export async function sincronizarPendencias(): Promise<void> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    await cliente.query("SELECT pg_advisory_xact_lock(7001)");

    await cliente.query(
      `WITH ${ALVOS},
       novas AS (
         INSERT INTO pendencias (tipo, prioridade, mesario_id, secao_id, contexto)
         SELECT tipo, prioridade, mesario_id, secao_id, contexto FROM alvo
         ON CONFLICT (tipo, (COALESCE(mesario_id, 0)), (COALESCE(secao_id, 0)))
           WHERE status <> 'resolvida' DO NOTHING
         RETURNING id
       )
       INSERT INTO historico_eventos (entidade, entidade_id, texto)
       SELECT 'pendencia', id, 'Pendência criada automaticamente.' FROM novas`,
    );

    await cliente.query(
      `WITH ${ALVOS}
       UPDATE pendencias p
          SET prioridade = a.prioridade, contexto = a.contexto, atualizada_em = now()
         FROM alvo a
        WHERE p.status <> 'resolvida' AND ${MESMO_ALVO}
          AND (p.prioridade <> a.prioridade OR p.contexto <> a.contexto)`,
    );

    await cliente.query(
      `WITH ${ALVOS},
       encerradas AS (
         UPDATE pendencias p
            SET status = 'resolvida', resolvida_em = now(), atualizada_em = now()
          WHERE p.status <> 'resolvida'
            AND p.tipo <> '${TIPO_MANUAL}'
            AND NOT EXISTS (SELECT 1 FROM alvo a WHERE ${MESMO_ALVO})
          RETURNING id
       )
       INSERT INTO historico_eventos (entidade, entidade_id, texto)
       SELECT 'pendencia', id, 'Resolvida automaticamente: a situação foi corrigida.' FROM encerradas`,
    );

    await cliente.query("COMMIT");
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

/* ---------- consulta ---------- */

export interface PendenciaLinha {
  id: number;
  tipo: TipoPendencia;
  titulo: string;
  prioridade: Prioridade;
  status: StatusPendencia;
  mesario_id: number | null;
  secao_id: number | null;
  pessoa: string | null;
  secao: string | null;
  contexto: string;
  responsavel: string | null;
  criada_em: string;
  manual: boolean;
}

export interface ResumoPendencias {
  todas: number;
  criticas: number;
  atencao: number;
  informativas: number;
  resolvidas: number;
}

const BASE = `
WITH calc AS (
  SELECT p.id, p.tipo, p.prioridade, p.status, p.mesario_id, p.secao_id, p.contexto,
         p.criada_em, m.nome_civil AS pessoa,
         CASE WHEN s.id IS NOT NULL THEN 'Seção ' || s.numero_secao || ' · ' || l.nome END AS secao,
         s.numero_secao, l.nome AS local,
         split_part(u.email, '@', 1) AS responsavel
    FROM pendencias p
    LEFT JOIN mesarios m ON m.id = p.mesario_id
    LEFT JOIN secoes s ON s.id = p.secao_id
    LEFT JOIN locais_votacao l ON l.id = s.local_id
    LEFT JOIN usuarios u ON u.id = p.responsavel_id
)`;

const ORDEM = `CASE prioridade WHEN 'critica' THEN 1 WHEN 'atencao' THEN 2 ELSE 3 END`;

function aLinha(r: Omit<PendenciaLinha, "titulo" | "manual">): PendenciaLinha {
  return { ...r, titulo: TITULO_PENDENCIA[r.tipo], manual: r.tipo === TIPO_MANUAL };
}

export async function listarPendencias(
  p: { pagina: number; limite: number },
  f: { q?: string; status?: string; prioridade?: string; tipo?: string },
): Promise<{
  itens: PendenciaLinha[];
  total: number;
  pagina: number;
  limite: number;
  resumo: ResumoPendencias;
}> {
  const condicoes: string[] = [];
  const valores: unknown[] = [];
  const adicionar = (cond: (m: string) => string, valor: unknown) => {
    valores.push(valor);
    condicoes.push(cond(`$${valores.length}`));
  };

  // Sem filtro de situação, só as que ainda pedem ação.
  if (f.status) adicionar((m) => `status = ${m}`, f.status);
  else condicoes.push("status <> 'resolvida'");
  if (f.prioridade) adicionar((m) => `prioridade = ${m}`, f.prioridade);
  if (f.tipo) adicionar((m) => `tipo = ${m}`, f.tipo);
  if (f.q) {
    const like = `%${f.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    valores.push(like);
    const m = `$${valores.length}`;
    const partes = [
      `COALESCE(pessoa, '') ILIKE ${m} ESCAPE '\\'`,
      `COALESCE(local, '') ILIKE ${m} ESCAPE '\\'`,
      `contexto ILIKE ${m} ESCAPE '\\'`,
    ];
    const digitos = f.q.replace(/\D/g, "");
    if (digitos.length >= 1) {
      valores.push(digitos);
      partes.push(`COALESCE(numero_secao::text, '') = $${valores.length}`);
    }
    condicoes.push(`(${partes.join(" OR ")})`);
  }
  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
  const n = valores.length;

  const [itens, total, resumo] = await Promise.all([
    pool.query<Omit<PendenciaLinha, "titulo" | "manual">>(
      `${BASE}
       SELECT id, tipo, prioridade, status, mesario_id, secao_id, pessoa, secao,
              contexto, responsavel, criada_em
         FROM calc ${where}
        ORDER BY ${ORDEM}, criada_em DESC, id DESC
        LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...valores, p.limite, (p.pagina - 1) * p.limite],
    ),
    pool.query<{ total: string }>(`${BASE} SELECT count(*) AS total FROM calc ${where}`, valores),
    pool.query<Record<keyof ResumoPendencias, string>>(
      `SELECT count(*) FILTER (WHERE status <> 'resolvida') AS todas,
              count(*) FILTER (WHERE status <> 'resolvida' AND prioridade = 'critica') AS criticas,
              count(*) FILTER (WHERE status <> 'resolvida' AND prioridade = 'atencao') AS atencao,
              count(*) FILTER (WHERE status <> 'resolvida' AND prioridade = 'informativa') AS informativas,
              count(*) FILTER (WHERE status = 'resolvida') AS resolvidas
         FROM pendencias`,
    ),
  ]);

  const r = resumo.rows[0];
  return {
    itens: itens.rows.map(aLinha),
    total: Number(total.rows[0].total),
    pagina: p.pagina,
    limite: p.limite,
    resumo: {
      todas: Number(r.todas),
      criticas: Number(r.criticas),
      atencao: Number(r.atencao),
      informativas: Number(r.informativas),
      resolvidas: Number(r.resolvidas),
    },
  };
}

export interface PendenciaDetalhe extends PendenciaLinha {
  resolvida_em: string | null;
  historico: Evento[];
}

export async function buscarPendencia(id: number): Promise<PendenciaDetalhe | null> {
  const r = await pool.query<Omit<PendenciaLinha, "titulo" | "manual"> & { resolvida_em: string | null }>(
    `${BASE}
     SELECT c.id, c.tipo, c.prioridade, c.status, c.mesario_id, c.secao_id, c.pessoa, c.secao,
            c.contexto, c.responsavel, c.criada_em, p.resolvida_em
       FROM calc c JOIN pendencias p ON p.id = c.id
      WHERE c.id = $1`,
    [id],
  );
  if (r.rowCount === 0) return null;
  const { resolvida_em, ...linha } = r.rows[0];
  return { ...aLinha(linha), resolvida_em, historico: await listarEventos("pendencia", id) };
}

export type ResultadoPendencia =
  | { ok: true }
  | { ok: false; motivo: "nao_encontrada" | "ja_resolvida" | "nao_manual" | "ja_em_analise" };

/** "assumir" põe em análise com o usuário como responsável; "resolver" só vale para as manuais. */
export async function atualizarPendencia(
  id: number,
  acao: "assumir" | "resolver",
  usuarioId: number,
): Promise<ResultadoPendencia> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const atual = await cliente.query<{ tipo: TipoPendencia; status: StatusPendencia; mesario_id: number | null }>(
      "SELECT tipo, status, mesario_id FROM pendencias WHERE id = $1 FOR UPDATE",
      [id],
    );
    const p = atual.rows[0];
    if (!p) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "nao_encontrada" };
    }
    if (p.status === "resolvida") {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "ja_resolvida" };
    }

    if (acao === "assumir") {
      if (p.status === "em_analise") {
        await cliente.query("ROLLBACK");
        return { ok: false, motivo: "ja_em_analise" };
      }
      await cliente.query(
        "UPDATE pendencias SET status = 'em_analise', responsavel_id = $2, atualizada_em = now() WHERE id = $1",
        [id, usuarioId],
      );
      await registrarEvento(cliente, "pendencia", id, "Análise iniciada.", usuarioId);
    } else {
      if (p.tipo !== TIPO_MANUAL) {
        await cliente.query("ROLLBACK");
        return { ok: false, motivo: "nao_manual" };
      }
      await cliente.query(
        `UPDATE pendencias
            SET status = 'resolvida', resolvida_em = now(), resolvida_por = $2, atualizada_em = now()
          WHERE id = $1`,
        [id, usuarioId],
      );
      await registrarEvento(cliente, "pendencia", id, "Marcada como resolvida.", usuarioId);
      if (p.mesario_id !== null) {
        await registrarEvento(cliente, "manifestacao", p.mesario_id, "Possível impedimento resolvido.", usuarioId);
      }
    }
    await cliente.query("COMMIT");
    return { ok: true };
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

export type ResultadoImpedimento =
  | { ok: true; id: number }
  | { ok: false; motivo: "mesario_nao_encontrado" | "ja_registrado" };

/** Registra um possível impedimento (a única pendência criada por uma pessoa). */
export async function registrarImpedimento(
  mesarioId: number,
  contexto: string,
  usuarioId: number,
): Promise<ResultadoImpedimento> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const existe = await cliente.query("SELECT 1 FROM mesarios WHERE id = $1 FOR UPDATE", [mesarioId]);
    if (existe.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "mesario_nao_encontrado" };
    }
    const aberta = await cliente.query(
      "SELECT 1 FROM pendencias WHERE mesario_id = $1 AND tipo = $2 AND status <> 'resolvida'",
      [mesarioId, TIPO_MANUAL],
    );
    if ((aberta.rowCount ?? 0) > 0) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "ja_registrado" };
    }
    const nova = await cliente.query<{ id: number }>(
      `INSERT INTO pendencias (tipo, prioridade, mesario_id, contexto)
       VALUES ($1, 'atencao', $2, $3) RETURNING id`,
      [TIPO_MANUAL, mesarioId, contexto],
    );
    const id = nova.rows[0].id;
    await registrarEvento(cliente, "pendencia", id, "Pendência registrada pelo cartório.", usuarioId);
    await registrarEvento(cliente, "manifestacao", mesarioId, `Possível impedimento registrado: ${contexto}`, usuarioId);
    await cliente.query("COMMIT");
    return { ok: true, id };
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

export async function contarPendenciasAbertas(): Promise<number> {
  const r = await pool.query<{ n: string }>(
    "SELECT count(*) AS n FROM pendencias WHERE status <> 'resolvida'",
  );
  return Number(r.rows[0].n);
}
