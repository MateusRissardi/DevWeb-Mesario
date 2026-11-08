import pool from "@/lib/db";
import type { Papel, UsuarioPublico } from "@/lib/server/auth/tipos";

export interface UsuarioComHash extends UsuarioPublico {
  senha_hash: string;
}

const COLUNAS_PUBLICAS = "id, email, papel, mesario_id, criado_em";

export async function buscarPorEmail(
  email: string,
): Promise<UsuarioComHash | null> {
  const resultado = await pool.query<UsuarioComHash>(
    `SELECT ${COLUNAS_PUBLICAS}, senha_hash FROM usuarios WHERE email = $1`,
    [email],
  );
  return resultado.rows[0] ?? null;
}

export async function buscarPublicoPorId(
  id: number,
): Promise<UsuarioPublico | null> {
  const resultado = await pool.query<UsuarioPublico>(
    `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = $1`,
    [id],
  );
  return resultado.rows[0] ?? null;
}

export async function listarPublicos(): Promise<UsuarioPublico[]> {
  const resultado = await pool.query<UsuarioPublico>(
    `SELECT ${COLUNAS_PUBLICAS} FROM usuarios ORDER BY id`,
  );
  return resultado.rows;
}

export async function buscarMesarioId(
  cpf: string,
  tituloEleitor: string,
): Promise<number | null> {
  const resultado = await pool.query<{ id: number }>(
    "SELECT id FROM mesarios WHERE cpf = $1 AND titulo_eleitor = $2",
    [cpf, tituloEleitor],
  );
  return resultado.rows[0]?.id ?? null;
}

export async function inserirUsuario(dados: {
  email: string;
  senhaHash: string;
  papel: Papel;
  mesarioId: number | null;
}): Promise<UsuarioPublico> {
  const resultado = await pool.query<UsuarioPublico>(
    `INSERT INTO usuarios (email, senha_hash, papel, mesario_id)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUNAS_PUBLICAS}`,
    [dados.email, dados.senhaHash, dados.papel, dados.mesarioId],
  );
  return resultado.rows[0];
}

export async function contarFalhasRecentes(
  email: string,
  ip: string | null,
  janelaMinutos: number,
): Promise<{ porEmail: number; porIp: number }> {
  const resultado = await pool.query<{ por_email: string; por_ip: string }>(
    `SELECT
       count(*) FILTER (WHERE email = $1) AS por_email,
       count(*) FILTER (WHERE $2::varchar IS NOT NULL AND ip = $2) AS por_ip
     FROM tentativas_login
     WHERE criada_em > now() - make_interval(mins => $3)`,
    [email, ip, janelaMinutos],
  );
  const linha = resultado.rows[0];
  return { porEmail: Number(linha.por_email), porIp: Number(linha.por_ip) };
}

export async function registrarFalha(
  email: string,
  ip: string | null,
): Promise<void> {
  await pool.query(
    "INSERT INTO tentativas_login (email, ip) VALUES ($1, $2)",
    [email, ip],
  );
  // Limpeza oportunista: falhas com mais de um dia não servem mais.
  await pool.query(
    "DELETE FROM tentativas_login WHERE criada_em < now() - interval '1 day'",
  );
}

export async function limparFalhas(email: string): Promise<void> {
  await pool.query("DELETE FROM tentativas_login WHERE email = $1", [email]);
}
