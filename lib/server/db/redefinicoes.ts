import pool from "@/lib/db";

export async function contarRecentes(
  usuarioId: number,
  janelaMinutos: number,
): Promise<number> {
  const resultado = await pool.query<{ total: string }>(
    `SELECT count(*) AS total FROM redefinicoes_senha
     WHERE usuario_id = $1 AND criada_em > now() - make_interval(mins => $2)`,
    [usuarioId, janelaMinutos],
  );
  return Number(resultado.rows[0].total);
}

export async function criarRedefinicao(
  usuarioId: number,
  tokenHash: string,
  validadeMinutos: number,
): Promise<void> {
  await pool.query(
    `INSERT INTO redefinicoes_senha (usuario_id, token_hash, expira_em)
     VALUES ($1, $2, now() + make_interval(mins => $3))`,
    [usuarioId, tokenHash, validadeMinutos],
  );
  // Limpeza oportunista: links vencidos há mais de um dia não servem mais.
  await pool.query(
    "DELETE FROM redefinicoes_senha WHERE expira_em < now() - interval '1 day'",
  );
}

/**
 * Troca a senha usando um token ainda válido, numa única transação:
 * confere o token, grava a senha nova, inutiliza todos os links da conta e
 * limpa as falhas de login. Devolve false se o token não vale mais.
 */
export async function consumirRedefinicao(
  tokenHash: string,
  novaSenhaHash: string,
): Promise<boolean> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    const token = await cliente.query<{ usuario_id: number }>(
      `SELECT usuario_id FROM redefinicoes_senha
       WHERE token_hash = $1 AND usada_em IS NULL AND expira_em > now()
       FOR UPDATE`,
      [tokenHash],
    );
    const usuarioId = token.rows[0]?.usuario_id;
    if (usuarioId === undefined) {
      await cliente.query("ROLLBACK");
      return false;
    }

    const usuario = await cliente.query<{ email: string }>(
      "UPDATE usuarios SET senha_hash = $1 WHERE id = $2 RETURNING email",
      [novaSenhaHash, usuarioId],
    );
    await cliente.query(
      "UPDATE redefinicoes_senha SET usada_em = now() WHERE usuario_id = $1 AND usada_em IS NULL",
      [usuarioId],
    );
    await cliente.query("DELETE FROM tentativas_login WHERE email = $1", [
      usuario.rows[0].email,
    ]);

    await cliente.query("COMMIT");
    return true;
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}
