import { NextResponse } from "next/server";

import { autorizar } from "@/lib/server/auth/guard";
import { registrarErro, respostaErro } from "@/lib/server/http";

// Dados da conta de quem está logado. Qualquer papel, desde que haja token.
export async function GET(request: Request) {
  try {
    const acesso = await autorizar(request);
    if (!acesso.ok) {
      return acesso.resposta;
    }

    return NextResponse.json({ usuario: acesso.usuario });
  } catch (erro) {
    registrarErro("usuario-atual", erro);
    return respostaErro(500, "Erro interno");
  }
}
