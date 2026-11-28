import type { Pool, PoolClient } from "pg";

import pool from "@/lib/db";

export type EntidadeEvento = "manifestacao" | "pendencia" | "secao";

export interface Evento {
  id: number;
  texto: string;
  autor: string | null;
  criado_em: string;
}

type Executor = Pick<Pool | PoolClient, "query">;

/** Anota uma ação no histórico. Aceita o cliente da transação para ficar junto dela. */
export async function registrarEvento(
  executor: Executor,
  entidade: EntidadeEvento,
  entidadeId: number,
  texto: string,
  usuarioId: number | null,
): Promise<void> {
  await executor.query(
    `INSERT INTO historico_eventos (entidade, entidade_id, texto, usuario_id)
     VALUES ($1, $2, $3, $4)`,
    [entidade, entidadeId, texto.slice(0, 300), usuarioId],
  );
}

/** Eventos mais recentes primeiro. O autor é a parte local do e-mail de quem fez a ação. */
export async function listarEventos(
  entidade: EntidadeEvento,
  entidadeId: number,
  limite = 20,
): Promise<Evento[]> {
  const r = await pool.query<Evento>(
    `SELECT e.id, e.texto, split_part(u.email, '@', 1) AS autor, e.criado_em
       FROM historico_eventos e
       LEFT JOIN usuarios u ON u.id = e.usuario_id
      WHERE e.entidade = $1 AND e.entidade_id = $2
      ORDER BY e.criado_em DESC, e.id DESC
      LIMIT $3`,
    [entidade, entidadeId, limite],
  );
  return r.rows;
}
