import pool from "@/lib/db";
import { FUNCOES_DA_MESA, type Funcao } from "@/lib/server/validation/cartorio";

import { listarEventos, registrarEvento, type Evento } from "./eventos";

/** Mostra só os 4 últimos dígitos do título: "••••••••1234". */
export const mascararTitulo = (titulo: string) => `••••••••${titulo.slice(-4)}`;

export interface Validacao {
  rotulo: string;
  ok: boolean;
}

export interface VoluntarioDetalhe {
  id: number;
  nome: string;
  titulo_mascarado: string;
  data_nascimento: string;
  municipio: string;
  zona_eleitoral: number;
  secao_eleitoral: number;
  local_votacao: string;
  telefone: string | null;
  telefone_whatsapp: boolean;
  email: string | null;
  origem: "portal" | "presencial";
  situacao: "nova" | "em_analise" | "apta";
  interesse_ativo: boolean;
  criado_em: string;
  alocacao: {
    id: number;
    funcao: Funcao;
    situacao: "pre_selecionado" | "selecionado";
    numero_secao: number;
    local: string;
  } | null;
  validacoes: Validacao[];
  apta_para_marcar: boolean;
  impedimento_id: number | null;
  historico: Evento[];
}

interface Base {
  id: number;
  nome: string;
  titulo: string;
  data_nascimento: string;
  municipio: string;
  zona_eleitoral: number;
  secao_eleitoral: number;
  local_votacao: string;
  telefone: string | null;
  telefone_whatsapp: boolean;
  email: string | null;
  origem: "portal" | "presencial";
  situacao: "nova" | "em_analise" | "apta";
  interesse_ativo: boolean;
  criado_em: string;
  impedimento_id: number | null;
}

const BASE_SQL = `
  SELECT m.id, m.nome_civil AS nome, m.titulo_eleitor AS titulo,
         to_char(m.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
         m.municipio, m.zona_eleitoral, m.secao_eleitoral, m.local_votacao,
         m.telefone, m.telefone_whatsapp, m.email, m.origem,
         m.situacao_analise AS situacao,
         COALESCE(m.status_interesse, true) AS interesse_ativo, m.criado_em,
         (SELECT p.id FROM pendencias p
           WHERE p.mesario_id = m.id AND p.tipo = 'possivel_impedimento' AND p.status <> 'resolvida'
           LIMIT 1) AS impedimento_id
    FROM mesarios m`;

function validar(b: Base): Validacao[] {
  return [
    { rotulo: "Cadastro eleitoral localizado", ok: true },
    { rotulo: "Interesse ativo", ok: b.interesse_ativo },
    { rotulo: "Telefone de contato informado", ok: !!b.telefone && b.telefone.trim() !== "" },
    { rotulo: "Nenhum impedimento registrado", ok: b.impedimento_id === null },
  ];
}

export async function detalheVoluntario(id: number): Promise<VoluntarioDetalhe | null> {
  const r = await pool.query<Base>(`${BASE_SQL} WHERE m.id = $1`, [id]);
  const b = r.rows[0];
  if (!b) return null;

  const aloc = await pool.query<NonNullable<VoluntarioDetalhe["alocacao"]>>(
    `SELECT a.id, a.funcao, a.situacao, s.numero_secao, l.nome AS local
       FROM alocacoes a JOIN secoes s ON s.id = a.secao_id
       JOIN locais_votacao l ON l.id = s.local_id
      WHERE a.mesario_id = $1`,
    [id],
  );
  const validacoes = validar(b);
  const { titulo, impedimento_id, ...resto } = b;
  return {
    ...resto,
    titulo_mascarado: mascararTitulo(titulo),
    impedimento_id,
    alocacao: aloc.rows[0] ?? null,
    validacoes,
    apta_para_marcar: validacoes.every((v) => v.ok) && b.situacao !== "apta",
    historico: await listarEventos("manifestacao", id, 20),
  };
}

export type ResultadoAnalise =
  | { ok: true }
  | {
      ok: false;
      motivo: "nao_encontrado" | "ja_em_analise" | "ja_apta" | "nao_esta_nova" | "validacao";
      validacoes?: Validacao[];
    };

/** "iniciar": nova → em análise. "marcar_apta": exige todas as validações. */
export async function analisarVoluntario(
  id: number,
  acao: "iniciar" | "marcar_apta",
  usuarioId: number,
): Promise<ResultadoAnalise> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const r = await cliente.query<Base>(`${BASE_SQL} WHERE m.id = $1 FOR UPDATE OF m`, [id]);
    const b = r.rows[0];
    if (!b) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "nao_encontrado" };
    }

    if (acao === "iniciar") {
      if (b.situacao === "apta") {
        await cliente.query("ROLLBACK");
        return { ok: false, motivo: "ja_apta" };
      }
      if (b.situacao === "em_analise") {
        await cliente.query("ROLLBACK");
        return { ok: false, motivo: "ja_em_analise" };
      }
      await cliente.query("UPDATE mesarios SET situacao_analise = 'em_analise' WHERE id = $1", [id]);
      await registrarEvento(cliente, "manifestacao", id, "Análise iniciada.", usuarioId);
    } else {
      if (b.situacao === "apta") {
        await cliente.query("ROLLBACK");
        return { ok: false, motivo: "ja_apta" };
      }
      const validacoes = validar(b);
      if (!validacoes.every((v) => v.ok)) {
        await cliente.query("ROLLBACK");
        return { ok: false, motivo: "validacao", validacoes };
      }
      await cliente.query("UPDATE mesarios SET situacao_analise = 'apta' WHERE id = $1", [id]);
      await registrarEvento(cliente, "manifestacao", id, "Marcada como apta.", usuarioId);
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

export interface VagaCompativel {
  secao_id: number;
  numero_secao: number;
  local_id: number;
  local: string;
  funcao: Funcao;
  compatibilidade: "alta" | "media";
  motivos: string[];
}

export type ResultadoVagas =
  | { ok: true; itens: VagaCompativel[] }
  | { ok: false; motivo: "nao_encontrado" | "interesse_retirado" | "nao_apta" | "ja_alocado" };

/** Vagas abertas na zona do voluntário; as do mesmo local primeiro. */
export async function vagasDoVoluntario(id: number): Promise<ResultadoVagas> {
  const m = await pool.query<{ ativo: boolean; apta: boolean; alocado: boolean }>(
    `SELECT COALESCE(status_interesse, true) AS ativo, situacao_analise = 'apta' AS apta,
            EXISTS (SELECT 1 FROM alocacoes a WHERE a.mesario_id = mesarios.id) AS alocado
       FROM mesarios WHERE id = $1`,
    [id],
  );
  if (m.rowCount === 0) return { ok: false, motivo: "nao_encontrado" };
  if (!m.rows[0].ativo) return { ok: false, motivo: "interesse_retirado" };
  if (!m.rows[0].apta) return { ok: false, motivo: "nao_apta" };
  if (m.rows[0].alocado) return { ok: false, motivo: "ja_alocado" };

  const r = await pool.query<{
    secao_id: number;
    numero_secao: number;
    local_id: number;
    local: string;
    funcao: Funcao;
    mesmo_local: boolean;
    mesma_secao: boolean;
  }>(
    `SELECT s.id AS secao_id, s.numero_secao, l.id AS local_id, l.nome AS local, f.funcao,
            (lower(btrim(l.nome)) = lower(btrim(m.local_votacao))) AS mesmo_local,
            (s.numero_secao = m.secao_eleitoral) AS mesma_secao
       FROM mesarios m
       JOIN locais_votacao l ON l.zona_eleitoral = m.zona_eleitoral
       JOIN secoes s ON s.local_id = l.id
       CROSS JOIN unnest($2::text[]) WITH ORDINALITY AS f(funcao, ordem)
      WHERE m.id = $1
        AND NOT EXISTS (SELECT 1 FROM alocacoes a WHERE a.secao_id = s.id AND a.funcao = f.funcao)
      ORDER BY (lower(btrim(l.nome)) = lower(btrim(m.local_votacao))) DESC,
               (s.numero_secao = m.secao_eleitoral) DESC, f.ordem, s.numero_secao
      LIMIT 30`,
    [id, [...FUNCOES_DA_MESA]],
  );

  return {
    ok: true,
    itens: r.rows.map((v) => ({
      secao_id: v.secao_id,
      numero_secao: v.numero_secao,
      local_id: v.local_id,
      local: v.local,
      funcao: v.funcao,
      compatibilidade: v.mesmo_local ? "alta" : "media",
      motivos: [
        v.mesma_secao ? "Vota nesta seção" : null,
        v.mesmo_local ? "Vota neste local" : "Mesma zona eleitoral",
      ].filter((x): x is string => x !== null),
    })),
  };
}
