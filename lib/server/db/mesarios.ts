import pool from "@/lib/db";

// Lista explícita: o codigo_titulo nunca sai do banco por aqui.
const COLUNAS = `id, cpf, titulo_eleitor, nome_civil,
  to_char(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
  nome_mae, nome_pai, municipio, zona_eleitoral, secao_eleitoral,
  local_votacao, telefone, email, status_interesse, status_convocacao,
  criado_em`;

export interface MesarioRegistro {
  id: number;
  cpf: string;
  titulo_eleitor: string;
  nome_civil: string;
  data_nascimento: string;
  nome_mae: string;
  nome_pai: string | null;
  municipio: string;
  zona_eleitoral: number;
  secao_eleitoral: number;
  local_votacao: string;
  telefone: string | null;
  email: string | null;
  status_interesse: boolean | null;
  status_convocacao: string | null;
  criado_em: Date | null;
}

export async function listarMesarios(
  limite: number,
  offset: number,
): Promise<{ itens: MesarioRegistro[]; total: number }> {
  const [itens, total] = await Promise.all([
    pool.query<MesarioRegistro>(
      `SELECT ${COLUNAS} FROM mesarios ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limite, offset],
    ),
    pool.query<{ total: string }>("SELECT count(*) AS total FROM mesarios"),
  ]);
  return { itens: itens.rows, total: Number(total.rows[0].total) };
}

export async function buscarMesarioPorId(
  id: number,
): Promise<MesarioRegistro | null> {
  const resultado = await pool.query<MesarioRegistro>(
    `SELECT ${COLUNAS} FROM mesarios WHERE id = $1`,
    [id],
  );
  return resultado.rows[0] ?? null;
}

export async function buscarMesarioPorCpf(
  cpf: string,
): Promise<MesarioRegistro | null> {
  const resultado = await pool.query<MesarioRegistro>(
    `SELECT ${COLUNAS} FROM mesarios WHERE cpf = $1`,
    [cpf],
  );
  return resultado.rows[0] ?? null;
}

export interface DadosNovoMesario {
  cpf: string;
  titulo_eleitor: string;
  nome_civil: string;
  data_nascimento: string;
  nome_mae: string;
  nome_pai: string | null;
  municipio: string;
  zona_eleitoral: number;
  secao_eleitoral: number;
  local_votacao: string;
  telefone: string | null;
  email: string | null;
}

/**
 * Insere o cadastro. Se `usuarioId` vier (conta de mesário ainda sem cadastro),
 * liga a conta ao novo cadastro na mesma transação: ou fica tudo, ou nada.
 * Devolve `null` quando a conta já tinha cadastro (nada é gravado).
 */
export async function inserirMesario(
  dados: DadosNovoMesario,
  usuarioId: number | null = null,
): Promise<MesarioRegistro | null> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");

    const inserido = await cliente.query<MesarioRegistro>(
      `INSERT INTO mesarios
         (cpf, titulo_eleitor, nome_civil, data_nascimento, nome_mae, nome_pai,
          municipio, zona_eleitoral, secao_eleitoral, local_votacao, telefone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING ${COLUNAS}`,
      [
        dados.cpf,
        dados.titulo_eleitor,
        dados.nome_civil,
        dados.data_nascimento,
        dados.nome_mae,
        dados.nome_pai,
        dados.municipio,
        dados.zona_eleitoral,
        dados.secao_eleitoral,
        dados.local_votacao,
        dados.telefone,
        dados.email,
      ],
    );
    const mesario = inserido.rows[0];

    if (usuarioId !== null) {
      const ligado = await cliente.query(
        `UPDATE usuarios SET mesario_id = $1
         WHERE id = $2 AND papel = 'mesario' AND mesario_id IS NULL`,
        [mesario.id, usuarioId],
      );
      if ((ligado.rowCount ?? 0) === 0) {
        await cliente.query("ROLLBACK");
        return null;
      }
    }

    await cliente.query("COMMIT");
    return mesario;
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

/** Atualiza só os campos informados. Os nomes das colunas são fixos, nunca vêm da requisição. */
export async function atualizarMesario(
  id: number,
  campos: {
    telefone?: string | null;
    email?: string | null;
    status_interesse?: boolean;
  },
): Promise<MesarioRegistro | null> {
  const atribuicoes: string[] = [];
  const valores: unknown[] = [];

  for (const coluna of ["telefone", "email", "status_interesse"] as const) {
    const valor = campos[coluna];
    if (valor !== undefined) {
      valores.push(valor);
      atribuicoes.push(`${coluna} = $${valores.length}`);
    }
  }

  valores.push(id);
  const resultado = await pool.query<MesarioRegistro>(
    `UPDATE mesarios SET ${atribuicoes.join(", ")}
     WHERE id = $${valores.length}
     RETURNING ${COLUNAS}`,
    valores,
  );
  return resultado.rows[0] ?? null;
}

export async function excluirMesario(id: number): Promise<boolean> {
  const resultado = await pool.query("DELETE FROM mesarios WHERE id = $1", [
    id,
  ]);
  return (resultado.rowCount ?? 0) > 0;
}
