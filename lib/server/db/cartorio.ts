import type { PoolClient } from "pg";

import pool from "@/lib/db";
import { listarEventos, registrarEvento, type Evento } from "@/lib/server/db/eventos";
import {
  FUNCOES_DA_MESA,
  VAGAS_POR_SECAO,
  type Funcao,
  type StatusConvocacao,
} from "@/lib/server/validation/cartorio";

/* ---------- utilidades ---------- */

export interface Paginacao {
  pagina: number;
  limite: number;
}

export interface Pagina<T, R = undefined> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
  resumo: R;
}

const offsetDe = ({ pagina, limite }: Paginacao) => (pagina - 1) * limite;

function escaparLike(texto: string) {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Acumula condições e parâmetros ($1, $2...) sem concatenar valores no SQL. */
class Filtros {
  readonly condicoes: string[] = [];
  readonly valores: unknown[] = [];

  adicionar(condicao: (marcador: string) => string, valor: unknown) {
    this.valores.push(valor);
    this.condicoes.push(condicao(`$${this.valores.length}`));
  }

  /** Busca por texto e, se houver dígitos, também por CPF/título/seção. */
  buscar(q: string | undefined, colunasTexto: string[], colunasNumero: string[]) {
    if (!q) return;
    const like = `%${escaparLike(q)}%`;
    this.valores.push(like);
    const m = `$${this.valores.length}`;
    const partes = colunasTexto.map((c) => `${c} ILIKE ${m} ESCAPE '\\'`);

    const digitos = q.replace(/\D/g, "");
    if (digitos.length >= 3) {
      this.valores.push(`${digitos}%`);
      const d = `$${this.valores.length}`;
      for (const c of colunasNumero) partes.push(`${c}::text LIKE ${d}`);
    }
    this.condicoes.push(`(${partes.join(" OR ")})`);
  }

  get where() {
    return this.condicoes.length ? `WHERE ${this.condicoes.join(" AND ")}` : "";
  }
}

/* ---------- voluntários (manifestações) ---------- */

/**
 * Situação da manifestação: a análise registrada pelo cartório (nova, em análise, apta).
 * Seleção: "disponivel" (interesse ativo, sem alocação), "pre_selecionado"
 * (alocado, ainda não confirmado), "selecionado" (alocação confirmada) ou
 * "indisponivel" (retirou o interesse e não está alocado).
 */
const VOLUNTARIOS_CTE = `
WITH base AS (
  SELECT m.id, m.nome_civil AS nome, m.cpf, m.titulo_eleitor, m.local_votacao,
         m.zona_eleitoral, m.secao_eleitoral, m.telefone, m.email,
         COALESCE(m.status_interesse, true) AS interesse_ativo,
         m.criado_em, m.origem, m.situacao_analise,
         (m.telefone IS NULL OR btrim(m.telefone) = '') AS sem_telefone,
         (m.email IS NULL OR btrim(m.email) = '') AS sem_email,
         a.id AS alocacao_id, a.funcao, a.situacao AS alocacao_situacao,
         c.status AS convocacao_status
    FROM mesarios m
    LEFT JOIN alocacoes a ON a.mesario_id = m.id
    LEFT JOIN convocacoes c ON c.alocacao_id = a.id
), calc AS (
  SELECT base.*,
    CASE WHEN alocacao_id IS NULL AND NOT interesse_ativo THEN 'indisponivel'
         WHEN alocacao_id IS NULL THEN 'disponivel'
         WHEN alocacao_situacao = 'selecionado' THEN 'selecionado'
         ELSE 'pre_selecionado' END AS selecao,
    situacao_analise AS situacao,
    CASE WHEN sem_telefone AND sem_email THEN 'Sem contato'
         WHEN sem_telefone THEN 'Sem telefone'
         WHEN sem_email THEN 'Sem e-mail'
         ELSE 'Completo' END AS contato
    FROM base
)`;

export interface VoluntarioLinha {
  id: number;
  nome: string;
  local_votacao: string;
  zona_eleitoral: number;
  secao_eleitoral: number;
  interesse_ativo: boolean;
  situacao: "nova" | "apta" | "em_analise";
  origem: "portal" | "presencial";
  selecao: "disponivel" | "pre_selecionado" | "selecionado" | "indisponivel";
  contato: string;
  criado_em: string;
}

export interface ResumoVoluntarios {
  todas: number;
  novas: number;
  em_analise: number;
  aptas: number;
  ativos: number;
  disponiveis: number;
  pre_selecionados: number;
  selecionados: number;
}

export async function listarVoluntarios(
  p: Paginacao,
  f: {
    q?: string;
    situacao?: string;
    selecao?: string;
    interesse?: string;
    origem?: string;
  },
): Promise<Pagina<VoluntarioLinha, ResumoVoluntarios>> {
  const filtros = new Filtros();
  filtros.buscar(
    f.q,
    ["nome", "local_votacao"],
    ["cpf", "titulo_eleitor", "secao_eleitoral"],
  );
  if (f.situacao) filtros.adicionar((m) => `situacao = ${m}`, f.situacao);
  if (f.selecao) filtros.adicionar((m) => `selecao = ${m}`, f.selecao);
  if (f.origem) filtros.adicionar((m) => `origem = ${m}`, f.origem);
  if (f.interesse) {
    filtros.adicionar((m) => `interesse_ativo = ${m}`, f.interesse === "ativo");
  }

  const n = filtros.valores.length;
  const [itens, total, resumo] = await Promise.all([
    pool.query<VoluntarioLinha>(
      `${VOLUNTARIOS_CTE}
       SELECT id, nome, local_votacao, zona_eleitoral, secao_eleitoral,
              interesse_ativo, situacao, origem, selecao, contato, criado_em
         FROM calc ${filtros.where}
        ORDER BY criado_em DESC, id DESC
        LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...filtros.valores, p.limite, offsetDe(p)],
    ),
    pool.query<{ total: string }>(
      `${VOLUNTARIOS_CTE} SELECT count(*) AS total FROM calc ${filtros.where}`,
      filtros.valores,
    ),
    pool.query<Record<keyof ResumoVoluntarios, string>>(
      `${VOLUNTARIOS_CTE}
       SELECT count(*) AS todas,
              count(*) FILTER (WHERE situacao = 'nova') AS novas,
              count(*) FILTER (WHERE situacao = 'em_analise') AS em_analise,
              count(*) FILTER (WHERE situacao = 'apta') AS aptas,
              count(*) FILTER (WHERE interesse_ativo AND situacao = 'apta') AS ativos,
              count(*) FILTER (WHERE selecao = 'disponivel' AND situacao = 'apta') AS disponiveis,
              count(*) FILTER (WHERE selecao = 'pre_selecionado') AS pre_selecionados,
              count(*) FILTER (WHERE selecao = 'selecionado') AS selecionados
         FROM calc`,
    ),
  ]);

  const r = resumo.rows[0];
  return {
    itens: itens.rows,
    total: Number(total.rows[0].total),
    pagina: p.pagina,
    limite: p.limite,
    resumo: {
      todas: Number(r.todas),
      novas: Number(r.novas),
      em_analise: Number(r.em_analise),
      aptas: Number(r.aptas),
      ativos: Number(r.ativos),
      disponiveis: Number(r.disponiveis),
      pre_selecionados: Number(r.pre_selecionados),
      selecionados: Number(r.selecionados),
    },
  };
}

/* ---------- locais de votação ---------- */

/** Vagas de um local = 4 por seção (presidente, 1º, 2º mesário, secretário). */
const LOCAIS_CTE = `
WITH sec AS (
  SELECT s.id, s.local_id,
         count(a.id) FILTER (WHERE a.funcao <> 'suplente')::int AS ocupadas
    FROM secoes s LEFT JOIN alocacoes a ON a.secao_id = s.id
   GROUP BY s.id
), loc AS (
  SELECT l.id, l.nome, l.endereco, l.bairro, l.cidade, l.uf, l.zona_eleitoral,
         count(sec.id)::int AS secoes,
         count(sec.id) FILTER (WHERE sec.ocupadas = ${VAGAS_POR_SECAO})::int AS completas,
         COALESCE(sum(${VAGAS_POR_SECAO} - sec.ocupadas), 0)::int AS vagas
    FROM locais_votacao l LEFT JOIN sec ON sec.local_id = l.id
   GROUP BY l.id
), calc AS (
  SELECT loc.*,
    CASE WHEN secoes = 0 THEN 'sem_secoes'
         WHEN vagas = 0 THEN 'completo'
         WHEN vagas <= secoes THEN 'atencao'
         ELSE 'critico' END AS situacao
    FROM loc
)`;

export interface LocalLinha {
  id: number;
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string;
  uf: string;
  zona_eleitoral: number;
  secoes: number;
  completas: number;
  vagas: number;
  situacao: "sem_secoes" | "completo" | "atencao" | "critico";
}

export interface ResumoLocais {
  locais: number;
  secoes: number;
  completas: number;
  com_vagas: number;
}

export async function listarLocais(
  p: Paginacao,
  f: { q?: string; situacao?: string },
): Promise<Pagina<LocalLinha, ResumoLocais>> {
  const filtros = new Filtros();
  filtros.buscar(f.q, ["nome", "cidade", "COALESCE(bairro, '')"], ["zona_eleitoral"]);
  if (f.situacao) filtros.adicionar((m) => `situacao = ${m}`, f.situacao);

  const n = filtros.valores.length;
  const [itens, total, resumo] = await Promise.all([
    pool.query<LocalLinha>(
      `${LOCAIS_CTE} SELECT * FROM calc ${filtros.where}
        ORDER BY zona_eleitoral, nome LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...filtros.valores, p.limite, offsetDe(p)],
    ),
    pool.query<{ total: string }>(
      `${LOCAIS_CTE} SELECT count(*) AS total FROM calc ${filtros.where}`,
      filtros.valores,
    ),
    pool.query<Record<keyof ResumoLocais, string | null>>(
      `${LOCAIS_CTE}
       SELECT count(*) AS locais, COALESCE(sum(secoes), 0) AS secoes,
              COALESCE(sum(completas), 0) AS completas,
              COALESCE(sum(secoes - completas), 0) AS com_vagas
         FROM calc`,
    ),
  ]);

  const r = resumo.rows[0];
  return {
    itens: itens.rows,
    total: Number(total.rows[0].total),
    pagina: p.pagina,
    limite: p.limite,
    resumo: {
      locais: Number(r.locais),
      secoes: Number(r.secoes),
      completas: Number(r.completas),
      com_vagas: Number(r.com_vagas),
    },
  };
}

export async function buscarLocal(id: number): Promise<LocalLinha | null> {
  const r = await pool.query<LocalLinha>(
    `${LOCAIS_CTE} SELECT * FROM calc WHERE id = $1`,
    [id],
  );
  return r.rows[0] ?? null;
}

export interface DadosLocal {
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string;
  uf: string;
  zona_eleitoral: number;
}

export async function criarLocal(d: DadosLocal): Promise<number> {
  const r = await pool.query<{ id: number }>(
    `INSERT INTO locais_votacao (nome, endereco, bairro, cidade, uf, zona_eleitoral)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [d.nome, d.endereco, d.bairro, d.cidade, d.uf, d.zona_eleitoral],
  );
  return r.rows[0].id;
}

export async function atualizarLocal(
  id: number,
  d: DadosLocal,
): Promise<boolean> {
  const r = await pool.query(
    `UPDATE locais_votacao
        SET nome = $2, endereco = $3, bairro = $4, cidade = $5, uf = $6,
            zona_eleitoral = $7
      WHERE id = $1`,
    [id, d.nome, d.endereco, d.bairro, d.cidade, d.uf, d.zona_eleitoral],
  );
  return (r.rowCount ?? 0) > 0;
}

/** Exclui o local se não houver pessoas alocadas em suas seções. */
export async function excluirLocal(
  id: number,
): Promise<"excluido" | "nao_encontrado" | "com_alocacoes"> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const existe = await cliente.query("SELECT 1 FROM locais_votacao WHERE id = $1 FOR UPDATE", [id]);
    if (existe.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return "nao_encontrado";
    }
    const ocupado = await cliente.query(
      `SELECT 1 FROM alocacoes a JOIN secoes s ON s.id = a.secao_id
        WHERE s.local_id = $1 LIMIT 1`,
      [id],
    );
    if ((ocupado.rowCount ?? 0) > 0) {
      await cliente.query("ROLLBACK");
      return "com_alocacoes";
    }
    await cliente.query("DELETE FROM locais_votacao WHERE id = $1", [id]);
    await cliente.query("COMMIT");
    return "excluido";
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

/* ---------- seções ---------- */

export interface SecaoLinha {
  id: number;
  numero_secao: number;
  presidente: string | null;
  primeiro_mesario: string | null;
  segundo_mesario: string | null;
  secretario: string | null;
  ocupadas: number;
  vagas: number;
}

export interface ResumoSecoes {
  secoes: number;
  completas: number;
  com_vagas: number;
  vagas_abertas: number;
}

const SECOES_CTE = `
WITH calc AS (
  SELECT s.id, s.local_id, s.numero_secao,
         max(m.nome_civil) FILTER (WHERE a.funcao = 'presidente') AS presidente,
         max(m.nome_civil) FILTER (WHERE a.funcao = 'primeiro_mesario') AS primeiro_mesario,
         max(m.nome_civil) FILTER (WHERE a.funcao = 'segundo_mesario') AS segundo_mesario,
         max(m.nome_civil) FILTER (WHERE a.funcao = 'secretario') AS secretario,
         count(a.id) FILTER (WHERE a.funcao <> 'suplente')::int AS ocupadas
    FROM secoes s
    LEFT JOIN alocacoes a ON a.secao_id = s.id
    LEFT JOIN mesarios m ON m.id = a.mesario_id
   GROUP BY s.id
)`;

export async function listarSecoes(
  localId: number,
  p: Paginacao,
  f: { q?: string; situacao?: string },
): Promise<Pagina<SecaoLinha, ResumoSecoes>> {
  const filtros = new Filtros();
  filtros.adicionar((m) => `local_id = ${m}`, localId);
  filtros.buscar(
    f.q,
    [
      "COALESCE(presidente, '')",
      "COALESCE(primeiro_mesario, '')",
      "COALESCE(segundo_mesario, '')",
      "COALESCE(secretario, '')",
    ],
    ["numero_secao"],
  );
  if (f.situacao === "completa") filtros.condicoes.push(`ocupadas = ${VAGAS_POR_SECAO}`);
  if (f.situacao === "com_vaga") filtros.condicoes.push(`ocupadas < ${VAGAS_POR_SECAO}`);

  const n = filtros.valores.length;
  const [itens, total, resumo] = await Promise.all([
    pool.query<Omit<SecaoLinha, "vagas">>(
      `${SECOES_CTE} SELECT * FROM calc ${filtros.where}
        ORDER BY numero_secao LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...filtros.valores, p.limite, offsetDe(p)],
    ),
    pool.query<{ total: string }>(
      `${SECOES_CTE} SELECT count(*) AS total FROM calc ${filtros.where}`,
      filtros.valores,
    ),
    pool.query<Record<keyof ResumoSecoes, string | null>>(
      `${SECOES_CTE}
       SELECT count(*) AS secoes,
              count(*) FILTER (WHERE ocupadas = ${VAGAS_POR_SECAO}) AS completas,
              count(*) FILTER (WHERE ocupadas < ${VAGAS_POR_SECAO}) AS com_vagas,
              COALESCE(sum(${VAGAS_POR_SECAO} - ocupadas), 0) AS vagas_abertas
         FROM calc WHERE local_id = $1`,
      [localId],
    ),
  ]);

  const r = resumo.rows[0];
  return {
    itens: itens.rows.map((s) => ({ ...s, vagas: VAGAS_POR_SECAO - s.ocupadas })),
    total: Number(total.rows[0].total),
    pagina: p.pagina,
    limite: p.limite,
    resumo: {
      secoes: Number(r.secoes),
      completas: Number(r.completas),
      com_vagas: Number(r.com_vagas),
      vagas_abertas: Number(r.vagas_abertas),
    },
  };
}

/** Cria a seção. Devolve null se o local não existir. */
export async function criarSecao(
  localId: number,
  numero: number,
): Promise<number | null> {
  const r = await pool.query<{ id: number }>(
    `INSERT INTO secoes (numero_secao, local_id)
     SELECT $2, id FROM locais_votacao WHERE id = $1
     RETURNING id`,
    [localId, numero],
  );
  return r.rows[0]?.id ?? null;
}

export async function excluirSecao(
  id: number,
): Promise<"excluida" | "nao_encontrada" | "com_alocacoes"> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const existe = await cliente.query("SELECT 1 FROM secoes WHERE id = $1 FOR UPDATE", [id]);
    if (existe.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return "nao_encontrada";
    }
    const ocupada = await cliente.query("SELECT 1 FROM alocacoes WHERE secao_id = $1 LIMIT 1", [id]);
    if ((ocupada.rowCount ?? 0) > 0) {
      await cliente.query("ROLLBACK");
      return "com_alocacoes";
    }
    await cliente.query("DELETE FROM secoes WHERE id = $1", [id]);
    await cliente.query("COMMIT");
    return "excluida";
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

export interface ComposicaoItem {
  funcao: Funcao;
  alocacao_id: number | null;
  mesario_id: number | null;
  nome: string | null;
  convocacao_id: number | null;
  convocacao_status: StatusConvocacao | null;
  selecao: "pre_selecionado" | "selecionado" | null;
}

export interface SecaoDetalhe {
  id: number;
  numero_secao: number;
  local: { id: number; nome: string; cidade: string; uf: string; zona_eleitoral: number };
  composicao: ComposicaoItem[];
  vagas: number;
  historico: Evento[];
}

export async function buscarSecao(id: number): Promise<SecaoDetalhe | null> {
  const secao = await pool.query<{
    id: number;
    numero_secao: number;
    local_id: number;
    nome: string;
    cidade: string;
    uf: string;
    zona_eleitoral: number;
  }>(
    `SELECT s.id, s.numero_secao, l.id AS local_id, l.nome, l.cidade, l.uf, l.zona_eleitoral
       FROM secoes s JOIN locais_votacao l ON l.id = s.local_id WHERE s.id = $1`,
    [id],
  );
  const s = secao.rows[0];
  if (!s) return null;

  const alocados = await pool.query<ComposicaoItem>(
    `SELECT a.funcao, a.id AS alocacao_id, m.id AS mesario_id, m.nome_civil AS nome,
            c.id AS convocacao_id, c.status AS convocacao_status, a.situacao AS selecao
       FROM alocacoes a
       JOIN mesarios m ON m.id = a.mesario_id
       LEFT JOIN convocacoes c ON c.alocacao_id = a.id
      WHERE a.secao_id = $1
      ORDER BY a.id`,
    [id],
  );

  const vazio = (funcao: Funcao): ComposicaoItem => ({
    funcao,
    alocacao_id: null,
    mesario_id: null,
    nome: null,
    convocacao_id: null,
    convocacao_status: null,
    selecao: null,
  });
  const composicao: ComposicaoItem[] = [
    ...FUNCOES_DA_MESA.map(
      (f) => alocados.rows.find((a) => a.funcao === f) ?? vazio(f),
    ),
    ...alocados.rows.filter((a) => a.funcao === "suplente"),
  ];

  return {
    id: s.id,
    numero_secao: s.numero_secao,
    local: {
      id: s.local_id,
      nome: s.nome,
      cidade: s.cidade,
      uf: s.uf,
      zona_eleitoral: s.zona_eleitoral,
    },
    composicao,
    vagas: composicao.filter((c) => c.funcao !== "suplente" && c.alocacao_id === null).length,
    historico: await listarEventos("secao", id, 10),
  };
}

export interface Candidato {
  id: number;
  nome: string;
  local_votacao: string;
  zona_eleitoral: number;
  secao_eleitoral: number;
  contato_ok: boolean;
  motivos: string[];
}

/** Voluntários com interesse ativo e sem alocação, os mais compatíveis primeiro. */
export async function listarCandidatos(
  secaoId: number,
  q: string | undefined,
): Promise<Candidato[]> {
  const filtros = new Filtros();
  filtros.valores.push(secaoId);
  filtros.buscar(q, ["m.nome_civil", "m.local_votacao"], ["m.cpf", "m.titulo_eleitor"]);
  const extra = filtros.condicoes.length ? `AND ${filtros.condicoes.join(" AND ")}` : "";

  const r = await pool.query<{
    id: number;
    nome: string;
    local_votacao: string;
    zona_eleitoral: number;
    secao_eleitoral: number;
    contato_ok: boolean;
    mesmo_local: boolean;
    mesma_zona: boolean;
    mesma_secao: boolean;
  }>(
    `SELECT m.id, m.nome_civil AS nome, m.local_votacao, m.zona_eleitoral, m.secao_eleitoral,
            (m.telefone IS NOT NULL AND btrim(m.telefone) <> '') AS contato_ok,
            (lower(btrim(m.local_votacao)) = lower(btrim(l.nome))) AS mesmo_local,
            (m.zona_eleitoral = l.zona_eleitoral) AS mesma_zona,
            (m.zona_eleitoral = l.zona_eleitoral AND m.secao_eleitoral = s.numero_secao) AS mesma_secao
       FROM secoes s
       JOIN locais_votacao l ON l.id = s.local_id
       CROSS JOIN mesarios m
      WHERE s.id = $1
        AND COALESCE(m.status_interesse, true)
        AND m.situacao_analise = 'apta'
        AND NOT EXISTS (SELECT 1 FROM alocacoes a WHERE a.mesario_id = m.id)
        ${extra}
      ORDER BY (CASE WHEN lower(btrim(m.local_votacao)) = lower(btrim(l.nome)) THEN 2 ELSE 0 END
              + CASE WHEN m.zona_eleitoral = l.zona_eleitoral THEN 1 ELSE 0 END
              + CASE WHEN m.telefone IS NOT NULL AND btrim(m.telefone) <> '' THEN 1 ELSE 0 END) DESC,
               m.nome_civil
      LIMIT 20`,
    filtros.valores,
  );

  return r.rows.map((c) => ({
    id: c.id,
    nome: c.nome,
    local_votacao: c.local_votacao,
    zona_eleitoral: c.zona_eleitoral,
    secao_eleitoral: c.secao_eleitoral,
    contato_ok: c.contato_ok,
    motivos: [
      c.mesma_secao ? "Vota nesta seção" : null,
      c.mesmo_local ? "Vota neste local" : null,
      !c.mesmo_local && c.mesma_zona ? "Mesma zona eleitoral" : null,
      !c.contato_ok ? "Sem telefone" : null,
    ].filter((x): x is string => x !== null),
  }));
}

/* ---------- alocações (pré-seleção) ---------- */

export type ResultadoAlocar =
  | { ok: true; id: number }
  | {
      ok: false;
      motivo:
        | "mesario_nao_encontrado"
        | "secao_nao_encontrada"
        | "interesse_retirado"
        | "nao_apta"
        | "mesario_ja_alocado"
        | "funcao_ocupada";
    };

const ROTULO_FUNCAO: Record<Funcao, string> = {
  presidente: "Presidente",
  primeiro_mesario: "1º mesário",
  segundo_mesario: "2º mesário",
  secretario: "Secretário",
  suplente: "Suplente",
};

/** Aloca o voluntário e cria a convocação "pendente", tudo numa transação. */
export async function criarAlocacao(
  d: { mesario_id: number; secao_id: number; funcao: Funcao },
  usuarioId: number,
): Promise<ResultadoAlocar> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    const mesario = await cliente.query<{ ativo: boolean; situacao_analise: string }>(
      "SELECT COALESCE(status_interesse, true) AS ativo, situacao_analise FROM mesarios WHERE id = $1 FOR UPDATE",
      [d.mesario_id],
    );
    if (mesario.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "mesario_nao_encontrado" };
    }
    if (!mesario.rows[0].ativo) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "interesse_retirado" };
    }
    if (mesario.rows[0].situacao_analise !== "apta") {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "nao_apta" };
    }

    const secao = await cliente.query("SELECT 1 FROM secoes WHERE id = $1 FOR UPDATE", [d.secao_id]);
    if (secao.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "secao_nao_encontrada" };
    }

    const ja = await cliente.query("SELECT 1 FROM alocacoes WHERE mesario_id = $1", [d.mesario_id]);
    if ((ja.rowCount ?? 0) > 0) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "mesario_ja_alocado" };
    }

    if (d.funcao !== "suplente") {
      const ocupada = await cliente.query(
        "SELECT 1 FROM alocacoes WHERE secao_id = $1 AND funcao = $2",
        [d.secao_id, d.funcao],
      );
      if ((ocupada.rowCount ?? 0) > 0) {
        await cliente.query("ROLLBACK");
        return { ok: false, motivo: "funcao_ocupada" };
      }
    }

    const alocacao = await cliente.query<{ id: number }>(
      "INSERT INTO alocacoes (mesario_id, secao_id, funcao) VALUES ($1, $2, $3) RETURNING id",
      [d.mesario_id, d.secao_id, d.funcao],
    );
    await cliente.query(
      `INSERT INTO convocacoes (mesario_id, alocacao_id, status, registrado_por)
       VALUES ($1, $2, 'pendente', $3)`,
      [d.mesario_id, alocacao.rows[0].id, usuarioId],
    );
    const rotulo = await cliente.query<{ numero_secao: number; nome: string }>(
      `SELECT s.numero_secao, l.nome FROM secoes s JOIN locais_votacao l ON l.id = s.local_id WHERE s.id = $1`,
      [d.secao_id],
    );
    const onde = `${ROTULO_FUNCAO[d.funcao]} · Seção ${rotulo.rows[0].numero_secao} · ${rotulo.rows[0].nome}`;
    await registrarEvento(cliente, "manifestacao", d.mesario_id, `Pré-selecionado(a): ${onde}.`, usuarioId);
    await registrarEvento(cliente, "secao", d.secao_id, `${ROTULO_FUNCAO[d.funcao]} pré-selecionado(a).`, usuarioId);

    await cliente.query("COMMIT");
    return { ok: true, id: alocacao.rows[0].id };
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    // Outra requisição ganhou a corrida: as restrições únicas do banco garantem a consistência.
    const { constraint } = erro as { constraint?: string };
    if (constraint === "alocacoes_mesario_id_key") return { ok: false, motivo: "mesario_ja_alocado" };
    if (constraint === "alocacoes_secao_funcao_key") return { ok: false, motivo: "funcao_ocupada" };
    throw erro;
  } finally {
    cliente.release();
  }
}

/** Remove a alocação. A convocação fica no histórico, como "cancelado". */
export async function removerAlocacao(
  id: number,
  usuarioId: number,
): Promise<boolean> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const existe = await cliente.query<{ mesario_id: number; secao_id: number; funcao: Funcao }>(
      "SELECT mesario_id, secao_id, funcao FROM alocacoes WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (existe.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return false;
    }
    const a = existe.rows[0];
    await registrarEvento(cliente, "manifestacao", a.mesario_id, `Pré-seleção removida (${ROTULO_FUNCAO[a.funcao]}).`, usuarioId);
    await registrarEvento(cliente, "secao", a.secao_id, `${ROTULO_FUNCAO[a.funcao]} removido(a) da mesa.`, usuarioId);
    await cliente.query(
      `UPDATE convocacoes
          SET status = 'cancelado', observacao = 'Alocação removida',
              registrado_por = $2, atualizada_em = now()
        WHERE alocacao_id = $1`,
      [id, usuarioId],
    );
    await cliente.query("DELETE FROM alocacoes WHERE id = $1", [id]);
    await cliente.query("COMMIT");
    return true;
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

export interface AlocacaoLinha {
  id: number;
  funcao: Funcao;
  mesario_id: number;
  nome: string;
  secao_id: number;
  numero_secao: number;
  local_id: number;
  local: string;
  zona_eleitoral: number;
  selecao: "pre_selecionado" | "selecionado";
  convocacao_status: StatusConvocacao | null;
  alertas: string[];
  bloqueada: boolean;
  atualizado_em: string;
}

export interface ResumoAlocacoes {
  todas: number;
  pre_selecionados: number;
  selecionados: number;
  com_alerta: number;
  bloqueadas: number;
  prontas: number;
  vagas_abertas: number;
}

const ALOCACOES_CTE = `
WITH calc AS (
  SELECT a.id, a.funcao, m.id AS mesario_id, m.nome_civil AS nome,
         s.id AS secao_id, s.numero_secao, l.id AS local_id, l.nome AS local,
         l.zona_eleitoral, c.status AS convocacao_status,
         GREATEST(a.criado_em, COALESCE(c.atualizada_em, a.criado_em)) AS atualizado_em,
         a.situacao AS selecao,
         NOT COALESCE(m.status_interesse, true) AS interesse_retirado,
         (m.telefone IS NULL OR btrim(m.telefone) = '') AS sem_telefone,
         (NOT COALESCE(m.status_interesse, true)
            OR c.status IN ('recusado', 'cancelado')
            OR (m.telefone IS NULL OR btrim(m.telefone) = '')) AS com_alerta
    FROM alocacoes a
    JOIN mesarios m ON m.id = a.mesario_id
    JOIN secoes s ON s.id = a.secao_id
    JOIN locais_votacao l ON l.id = s.local_id
    LEFT JOIN convocacoes c ON c.alocacao_id = a.id
)`;

export async function listarAlocacoes(
  p: Paginacao,
  f: { q?: string; selecao?: string; alerta?: string },
): Promise<Pagina<AlocacaoLinha, ResumoAlocacoes>> {
  const filtros = new Filtros();
  filtros.buscar(f.q, ["nome", "local"], ["numero_secao"]);
  if (f.selecao) filtros.adicionar((m) => `selecao = ${m}`, f.selecao);
  if (f.alerta) filtros.condicoes.push(f.alerta === "com" ? "com_alerta" : "NOT com_alerta");

  type Bruta = Omit<AlocacaoLinha, "alertas" | "bloqueada"> & {
    interesse_retirado: boolean;
    sem_telefone: boolean;
  };

  const n = filtros.valores.length;
  const [itens, total, resumo] = await Promise.all([
    pool.query<Bruta>(
      `${ALOCACOES_CTE} SELECT * FROM calc ${filtros.where}
        ORDER BY atualizado_em DESC, id DESC LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...filtros.valores, p.limite, offsetDe(p)],
    ),
    pool.query<{ total: string }>(
      `${ALOCACOES_CTE} SELECT count(*) AS total FROM calc ${filtros.where}`,
      filtros.valores,
    ),
    pool.query<Record<Exclude<keyof ResumoAlocacoes, "vagas_abertas">, string>>(
      `${ALOCACOES_CTE}
       SELECT count(*) AS todas,
              count(*) FILTER (WHERE selecao = 'pre_selecionado') AS pre_selecionados,
              count(*) FILTER (WHERE selecao = 'selecionado') AS selecionados,
              count(*) FILTER (WHERE com_alerta) AS com_alerta,
              count(*) FILTER (WHERE interesse_retirado) AS bloqueadas,
              count(*) FILTER (WHERE selecao = 'pre_selecionado' AND NOT interesse_retirado) AS prontas
         FROM calc`,
    ),
  ]);

  const r = resumo.rows[0];
  const vagas = await pool.query<{ abertas: string }>(
    `SELECT (SELECT count(*) FROM secoes) * ${VAGAS_POR_SECAO}
          - (SELECT count(*) FROM alocacoes WHERE funcao <> 'suplente') AS abertas`,
  );
  return {
    itens: itens.rows.map(({ interesse_retirado, sem_telefone, ...resto }) => ({
      ...resto,
      bloqueada: interesse_retirado,
      alertas: [
        interesse_retirado ? "Interesse retirado" : null,
        resto.convocacao_status === "recusado" ? "Convocação recusada" : null,
        resto.convocacao_status === "cancelado" ? "Convocação cancelada" : null,
        sem_telefone ? "Sem telefone" : null,
      ].filter((x): x is string => x !== null),
    })),
    total: Number(total.rows[0].total),
    pagina: p.pagina,
    limite: p.limite,
    resumo: {
      todas: Number(r.todas),
      pre_selecionados: Number(r.pre_selecionados),
      selecionados: Number(r.selecionados),
      com_alerta: Number(r.com_alerta),
      bloqueadas: Number(r.bloqueadas),
      prontas: Number(r.prontas),
      vagas_abertas: Math.max(Number(vagas.rows[0].abertas), 0),
    },
  };
}

export interface ResultadoConfirmacao {
  confirmadas: number;
  bloqueadas: number[];
  ignoradas: number[];
}

/**
 * Passa pré-selecionados para "selecionado". Quem retirou o interesse fica
 * bloqueado (nada é alterado) e vai na lista de bloqueadas.
 */
export async function confirmarSelecoes(
  ids: number[],
  usuarioId: number,
): Promise<ResultadoConfirmacao> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const linhas = await cliente.query<{
      id: number;
      mesario_id: number;
      secao_id: number;
      funcao: Funcao;
      situacao: string;
      ativo: boolean;
    }>(
      `SELECT a.id, a.mesario_id, a.secao_id, a.funcao, a.situacao,
              COALESCE(m.status_interesse, true) AS ativo
         FROM alocacoes a JOIN mesarios m ON m.id = a.mesario_id
        WHERE a.id = ANY($1::int[])
        ORDER BY a.id
          FOR UPDATE OF a`,
      [ids],
    );

    const resultado: ResultadoConfirmacao = { confirmadas: 0, bloqueadas: [], ignoradas: [] };
    const achados = new Set(linhas.rows.map((l) => l.id));
    resultado.ignoradas.push(...ids.filter((id) => !achados.has(id)));

    for (const a of linhas.rows) {
      if (a.situacao === "selecionado") {
        resultado.ignoradas.push(a.id);
      } else if (!a.ativo) {
        resultado.bloqueadas.push(a.id);
      } else {
        await cliente.query(
          `UPDATE alocacoes SET situacao = 'selecionado', confirmada_em = now(), confirmada_por = $2
            WHERE id = $1`,
          [a.id, usuarioId],
        );
        await registrarEvento(cliente, "manifestacao", a.mesario_id, `Selecionado(a): ${ROTULO_FUNCAO[a.funcao]}.`, usuarioId);
        await registrarEvento(cliente, "secao", a.secao_id, `${ROTULO_FUNCAO[a.funcao]} confirmado(a) como selecionado(a).`, usuarioId);
        resultado.confirmadas += 1;
      }
    }
    await cliente.query("COMMIT");
    return resultado;
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

/* ---------- convocações (só registro de status; nenhuma mensagem é enviada) ---------- */

export interface ConvocacaoLinha {
  id: number;
  mesario_id: number;
  alocacao_id: number | null;
  nome: string;
  telefone: string | null;
  telefone_whatsapp: boolean;
  email: string | null;
  contato_ok: boolean;
  status: StatusConvocacao;
  observacao: string | null;
  atualizada_em: string;
  funcao: Funcao | null;
  numero_secao: number | null;
  local: string | null;
  zona_eleitoral: number | null;
}

export interface ResumoConvocacoes {
  todas: number;
  pendentes: number;
  convocados: number;
  confirmados: number;
  recusados: number;
  cancelados: number;
}

const CONVOCACOES_CTE = `
WITH calc AS (
  SELECT c.id, c.mesario_id, c.alocacao_id, m.nome_civil AS nome, m.telefone, m.telefone_whatsapp, m.email,
         (m.telefone IS NOT NULL AND btrim(m.telefone) <> '') AS contato_ok,
         c.status, c.observacao, c.atualizada_em,
         a.funcao, s.numero_secao, l.nome AS local, l.zona_eleitoral
    FROM convocacoes c
    JOIN mesarios m ON m.id = c.mesario_id
    LEFT JOIN alocacoes a ON a.id = c.alocacao_id
    LEFT JOIN secoes s ON s.id = a.secao_id
    LEFT JOIN locais_votacao l ON l.id = s.local_id
   WHERE c.alocacao_id IS NULL OR a.situacao = 'selecionado'
)`;

export async function listarConvocacoes(
  p: Paginacao,
  f: { q?: string; status?: string },
): Promise<Pagina<ConvocacaoLinha, ResumoConvocacoes>> {
  const filtros = new Filtros();
  filtros.buscar(f.q, ["nome", "COALESCE(local, '')"], ["numero_secao"]);
  if (f.status) filtros.adicionar((m) => `status = ${m}`, f.status);

  const n = filtros.valores.length;
  const [itens, total, resumo] = await Promise.all([
    pool.query<ConvocacaoLinha>(
      `${CONVOCACOES_CTE} SELECT * FROM calc ${filtros.where}
        ORDER BY atualizada_em DESC, id DESC LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...filtros.valores, p.limite, offsetDe(p)],
    ),
    pool.query<{ total: string }>(
      `${CONVOCACOES_CTE} SELECT count(*) AS total FROM calc ${filtros.where}`,
      filtros.valores,
    ),
    pool.query<Record<keyof ResumoConvocacoes, string>>(
      `${CONVOCACOES_CTE}
       SELECT count(*) AS todas,
              count(*) FILTER (WHERE status = 'pendente') AS pendentes,
              count(*) FILTER (WHERE status = 'convocado') AS convocados,
              count(*) FILTER (WHERE status = 'confirmado') AS confirmados,
              count(*) FILTER (WHERE status = 'recusado') AS recusados,
              count(*) FILTER (WHERE status = 'cancelado') AS cancelados
         FROM calc`,
    ),
  ]);

  const r = resumo.rows[0];
  return {
    itens: itens.rows,
    total: Number(total.rows[0].total),
    pagina: p.pagina,
    limite: p.limite,
    resumo: {
      todas: Number(r.todas),
      pendentes: Number(r.pendentes),
      convocados: Number(r.convocados),
      confirmados: Number(r.confirmados),
      recusados: Number(r.recusados),
      cancelados: Number(r.cancelados),
    },
  };
}

export type ResultadoConvocacao =
  | { ok: true; convocacao: ConvocacaoLinha }
  | { ok: false; motivo: "nao_encontrada" | "sem_alocacao" };

export async function atualizarConvocacao(
  id: number,
  status: StatusConvocacao,
  observacao: string | undefined,
  usuarioId: number,
): Promise<ResultadoConvocacao> {
  const cliente: PoolClient = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const atual = await cliente.query<{ alocacao_id: number | null; mesario_id: number }>(
      "SELECT alocacao_id, mesario_id FROM convocacoes WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (atual.rowCount === 0) {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "nao_encontrada" };
    }
    // Sem alocação (foi removida), a convocação só pode continuar cancelada.
    if (atual.rows[0].alocacao_id === null && status !== "cancelado") {
      await cliente.query("ROLLBACK");
      return { ok: false, motivo: "sem_alocacao" };
    }

    await cliente.query(
      `UPDATE convocacoes
          SET status = $2, observacao = COALESCE($3, observacao),
              registrado_por = $4, atualizada_em = now()
        WHERE id = $1`,
      [id, status, observacao ?? null, usuarioId],
    );
    await registrarEvento(cliente, "manifestacao", atual.rows[0].mesario_id, `Convocação registrada como ${status}.`, usuarioId);
    await cliente.query("COMMIT");
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }

  const linha = await pool.query<ConvocacaoLinha>(
    `${CONVOCACOES_CTE} SELECT * FROM calc WHERE id = $1`,
    [id],
  );
  return { ok: true, convocacao: linha.rows[0] };
}

/**
 * Marca como "convocado" as pendentes selecionadas que têm alocação e telefone.
 * O resto é ignorado (e devolvido na contagem) em vez de dar erro.
 */
export async function convocarEmLote(
  ids: number[],
  usuarioId: number,
): Promise<{ atualizadas: number; ignoradas: number }> {
  const r = await pool.query<{ mesario_id: number }>(
    `UPDATE convocacoes c
        SET status = 'convocado', registrado_por = $2, atualizada_em = now()
       FROM mesarios m
      WHERE c.id = ANY($1::int[])
        AND c.status = 'pendente'
        AND c.alocacao_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM alocacoes a WHERE a.id = c.alocacao_id AND a.situacao = 'selecionado')
        AND m.id = c.mesario_id
        AND m.telefone IS NOT NULL AND btrim(m.telefone) <> ''
      RETURNING c.mesario_id`,
    [ids, usuarioId],
  );
  for (const { mesario_id } of r.rows) {
    await registrarEvento(pool, "manifestacao", mesario_id, "Convocação registrada como convocado.", usuarioId);
  }
  const atualizadas = r.rowCount ?? 0;
  return { atualizadas, ignoradas: ids.length - atualizadas };
}

/* ---------- painel (visão geral) ---------- */

export interface PainelCartorio {
  manifestacoes: { total: number; ultimos_7_dias: number };
  disponiveis: number;
  selecionados: number;
  vagas: { total: number; preenchidas: number; restantes: number };
  atencao: {
    dados_incompletos: number;
    convocacoes_com_problema: number;
    interesse_retirado_com_alocacao: number;
    possiveis_impedimentos: number;
    secoes_incompletas: number;
  };
  locais_com_vagas: {
    id: number;
    nome: string;
    preenchidas: number;
    total: number;
    vagas: number;
  }[];
  recentes: {
    id: number;
    nome: string;
    local_votacao: string;
    situacao: "nova" | "apta" | "em_analise";
    origem: "portal" | "presencial";
    contato: string;
    criado_em: string;
  }[];
}

export async function painelCartorio(): Promise<PainelCartorio> {
  const [totais, vagas, locais, recentes, abertas] = await Promise.all([
    pool.query<Record<string, string>>(
      `${VOLUNTARIOS_CTE}
       SELECT count(*) AS total,
              count(*) FILTER (WHERE criado_em > now() - interval '7 days') AS ultimos_7,
              count(*) FILTER (WHERE interesse_ativo AND situacao = 'apta' AND alocacao_id IS NULL) AS disponiveis,
              count(*) FILTER (WHERE selecao = 'selecionado') AS selecionados,
              count(*) FILTER (WHERE interesse_ativo AND sem_telefone) AS dados_incompletos,
              count(*) FILTER (WHERE convocacao_status IN ('recusado','cancelado')) AS convocacoes_problema,
              count(*) FILTER (WHERE NOT interesse_ativo AND alocacao_id IS NOT NULL) AS retirou_alocado
         FROM calc`,
    ),
    pool.query<{ total: string; preenchidas: string }>(
      `SELECT (SELECT count(*) FROM secoes) * ${VAGAS_POR_SECAO} AS total,
              (SELECT count(*) FROM alocacoes WHERE funcao <> 'suplente') AS preenchidas`,
    ),
    pool.query<{ id: number; nome: string; secoes: number; vagas: number }>(
      `${LOCAIS_CTE} SELECT id, nome, secoes, vagas FROM calc
        WHERE vagas > 0 ORDER BY vagas DESC, nome LIMIT 5`,
    ),
    pool.query<PainelCartorio["recentes"][number]>(
      `${VOLUNTARIOS_CTE}
       SELECT id, nome, local_votacao, situacao, origem, contato, criado_em
         FROM calc ORDER BY criado_em DESC, id DESC LIMIT 5`,
    ),
    pool.query<{ tipo: string; n: string }>(
      `SELECT tipo, count(*) AS n FROM pendencias WHERE status <> 'resolvida' GROUP BY tipo`,
    ),
  ]);
  const porTipo = Object.fromEntries(abertas.rows.map((x) => [x.tipo, Number(x.n)]));

  const t = totais.rows[0];
  const total = Number(vagas.rows[0].total);
  const preenchidas = Number(vagas.rows[0].preenchidas);

  return {
    manifestacoes: { total: Number(t.total), ultimos_7_dias: Number(t.ultimos_7) },
    disponiveis: Number(t.disponiveis),
    selecionados: Number(t.selecionados),
    vagas: { total, preenchidas, restantes: Math.max(total - preenchidas, 0) },
    atencao: {
      dados_incompletos: Number(t.dados_incompletos),
      convocacoes_com_problema: Number(t.convocacoes_problema),
      interesse_retirado_com_alocacao: Number(t.retirou_alocado),
      possiveis_impedimentos: porTipo.possivel_impedimento ?? 0,
      secoes_incompletas: porTipo.secao_incompleta ?? 0,
    },
    locais_com_vagas: locais.rows.map((l) => ({
      id: l.id,
      nome: l.nome,
      total: l.secoes * VAGAS_POR_SECAO,
      preenchidas: l.secoes * VAGAS_POR_SECAO - l.vagas,
      vagas: l.vagas,
    })),
    recentes: recentes.rows,
  };
}
