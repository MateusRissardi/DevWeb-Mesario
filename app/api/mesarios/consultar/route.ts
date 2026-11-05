import { NextResponse } from "next/server";

import pool from "@/lib/db";

function ehObjeto(
  valor: unknown,
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Informe os dados de identificação." },
      { status: 400 },
    );
  }

  if (!ehObjeto(body)) {
    return NextResponse.json(
      { message: "Informe os dados de identificação." },
      { status: 400 },
    );
  }

  const identificador =
    typeof body.identificador === "string"
      ? body.identificador.replace(/\D/g, "")
      : "";
  const codigo =
    typeof body.codigo === "string" ? body.codigo.replace(/\D/g, "") : "";

  if (![11, 12].includes(identificador.length) || !codigo) {
    return NextResponse.json(
      { message: "CPF/título ou código de autenticação inválido." },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `SELECT mesarios.*
       FROM mesarios
       WHERE mesarios.codigo_titulo = $1
         AND (mesarios.cpf = $2 OR mesarios.titulo_eleitor = $2)
       LIMIT 1`,
      [codigo, identificador],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "CPF/título ou código de autenticação não conferem." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Erro ao consultar cadastro de mesário:", error);
    return NextResponse.json(
      { message: "Não foi possível consultar o cadastro neste momento." },
      { status: 500 },
    );
  }
}
