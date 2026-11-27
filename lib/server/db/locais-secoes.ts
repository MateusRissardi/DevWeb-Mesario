import pool from "@/lib/db";

export interface SecaoEleitoral {
  id: number;
  numero_secao: number;
  local_id: number;
  criado_em: Date | null;
}

export interface SecaoComLocal extends SecaoEleitoral {
  zona_eleitoral: number;
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string;
  uf: string;
}

export interface LocalVotacao {
  id: number;
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string;
  uf: string;
  zona_eleitoral: number;
  criado_em: Date | null;
  secoes: SecaoEleitoral[];
}

type CamposLocal = Partial<
  Pick<
    LocalVotacao,
    "nome" | "endereco" | "bairro" | "cidade" | "uf" | "zona_eleitoral"
  >
>;

export function ehSecaoReferenciadaPorAlocacao(erro: unknown): boolean {
  if (typeof erro !== "object" || erro === null) return false;

  return (
    "code" in erro &&
    erro.code === "23503" &&
    "constraint" in erro &&
    erro.constraint === "alocacoes_secao_id_fkey"
  );
}

interface LocalComSecaoLinha {
  id: number;
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string;
  uf: string;
  zona_eleitoral: number;
  criado_em: Date | null;
  secao_id: number | null;
  numero_secao: number | null;
  secao_criado_em: Date | null;
}

const COLUNAS_LOCAL =
  "id, nome, endereco, bairro, cidade, uf, zona_eleitoral, criado_em";

const COLUNAS_SECAO = "id, numero_secao, local_id, criado_em";

export async function listarLocaisComSecoes(): Promise<LocalVotacao[]> {
  const resultado = await pool.query<LocalComSecaoLinha>(
    `SELECT
       l.id, l.nome, l.endereco, l.bairro, l.cidade, l.uf,
       l.zona_eleitoral, l.criado_em,
       s.id AS secao_id, s.numero_secao,
       s.criado_em AS secao_criado_em
     FROM public.locais_votacao AS l
     LEFT JOIN public.secoes AS s ON s.local_id = l.id
     ORDER BY l.cidade, l.nome, s.numero_secao, s.id`,
  );

  const locais = new Map<number, LocalVotacao>();
  for (const linha of resultado.rows) {
    let local = locais.get(linha.id);
    if (!local) {
      local = {
        id: linha.id,
        nome: linha.nome,
        endereco: linha.endereco,
        bairro: linha.bairro,
        cidade: linha.cidade,
        uf: linha.uf,
        zona_eleitoral: linha.zona_eleitoral,
        criado_em: linha.criado_em,
        secoes: [],
      };
      locais.set(local.id, local);
    }

    if (linha.secao_id !== null && linha.numero_secao !== null) {
      local.secoes.push({
        id: linha.secao_id,
        numero_secao: linha.numero_secao,
        local_id: linha.id,
        criado_em: linha.secao_criado_em,
      });
    }
  }

  return [...locais.values()];
}

export async function buscarLocalPorId(
  id: number,
): Promise<LocalVotacao | null> {
  const resultado = await pool.query<Omit<LocalVotacao, "secoes">>(
    `SELECT ${COLUNAS_LOCAL}
     FROM public.locais_votacao
     WHERE id = $1`,
    [id],
  );
  const local = resultado.rows[0];
  if (!local) return null;

  const secoes = await listarSecoesPorLocal(id);
  return { ...local, secoes };
}

export async function inserirLocal(dados: {
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string;
  uf: string;
  zona_eleitoral: number;
}): Promise<LocalVotacao> {
  const resultado = await pool.query<Omit<LocalVotacao, "secoes">>(
    `INSERT INTO public.locais_votacao
       (nome, endereco, bairro, cidade, uf, zona_eleitoral)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUNAS_LOCAL}`,
    [
      dados.nome,
      dados.endereco,
      dados.bairro,
      dados.cidade,
      dados.uf,
      dados.zona_eleitoral,
    ],
  );
  return { ...resultado.rows[0], secoes: [] };
}

export async function atualizarLocal(
  id: number,
  campos: CamposLocal,
): Promise<LocalVotacao | null> {
  const atribuicoes: string[] = [];
  const valores: unknown[] = [];

  for (const coluna of [
    "nome",
    "endereco",
    "bairro",
    "cidade",
    "uf",
    "zona_eleitoral",
  ] as const) {
    const valor = campos[coluna];
    if (valor !== undefined) {
      valores.push(valor);
      atribuicoes.push(`${coluna} = $${valores.length}`);
    }
  }

  valores.push(id);
  const resultado = await pool.query(
    `UPDATE public.locais_votacao
     SET ${atribuicoes.join(", ")}
     WHERE id = $${valores.length}
     RETURNING id`,
    valores,
  );
  return resultado.rowCount ? buscarLocalPorId(id) : null;
}

export async function excluirLocal(id: number): Promise<boolean> {
  const resultado = await pool.query(
    "DELETE FROM public.locais_votacao WHERE id = $1 RETURNING id",
    [id],
  );
  return (resultado.rowCount ?? 0) > 0;
}

export async function listarSecoesPorLocal(
  localId: number,
): Promise<SecaoEleitoral[]> {
  const resultado = await pool.query<SecaoEleitoral>(
    `SELECT ${COLUNAS_SECAO}
     FROM public.secoes
     WHERE local_id = $1
     ORDER BY numero_secao, id`,
    [localId],
  );
  return resultado.rows;
}

export async function inserirSecao(
  localId: number,
  numeroSecao: number,
): Promise<SecaoEleitoral> {
  const resultado = await pool.query<SecaoEleitoral>(
    `INSERT INTO public.secoes (numero_secao, local_id)
     VALUES ($1, $2)
     RETURNING ${COLUNAS_SECAO}`,
    [numeroSecao, localId],
  );
  return resultado.rows[0];
}

export async function buscarSecaoPorId(
  id: number,
): Promise<SecaoComLocal | null> {
  const resultado = await pool.query<SecaoComLocal>(
    `SELECT
       s.id,
       s.numero_secao,
       s.local_id,
       s.criado_em,
       l.zona_eleitoral,
       l.nome,
       l.endereco,
       l.bairro,
       l.cidade,
       l.uf
     FROM public.secoes AS s
     INNER JOIN public.locais_votacao AS l ON l.id = s.local_id
     WHERE s.id = $1`,
    [id],
  );
  return resultado.rows[0] ?? null;
}

export async function atualizarSecao(
  id: number,
  numeroSecao: number,
): Promise<SecaoComLocal | null> {
  const resultado = await pool.query(
    `UPDATE public.secoes
     SET numero_secao = $1
     WHERE id = $2
     RETURNING id`,
    [numeroSecao, id],
  );
  return resultado.rowCount ? buscarSecaoPorId(id) : null;
}

export async function excluirSecao(id: number): Promise<boolean> {
  const resultado = await pool.query(
    "DELETE FROM public.secoes WHERE id = $1 RETURNING id",
    [id],
  );
  return (resultado.rowCount ?? 0) > 0;
}
