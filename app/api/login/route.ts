import { NextResponse } from "next/server";

import {
  ipDaRequisicao,
  lerJson,
  registrarErro,
  respostaErro,
} from "@/lib/server/http";
import { autenticar } from "@/lib/server/services/auth";
import { camposDoErro, loginSchema } from "@/lib/server/validation/usuarios";

export async function POST(request: Request) {
  const entrada = loginSchema.safeParse(await lerJson(request));
  if (!entrada.success) {
    return respostaErro(400, "Dados inválidos", {
      campos: camposDoErro(entrada.error),
    });
  }

  try {
    const resultado = await autenticar(
      entrada.data.email,
      entrada.data.senha,
      ipDaRequisicao(request),
    );

    if (!resultado.ok) {
      return respostaErro(resultado.status, resultado.erro, {
        headers: resultado.retryAfterSegundos
          ? { "Retry-After": String(resultado.retryAfterSegundos) }
          : undefined,
      });
    }

    return NextResponse.json(
      {
        token: resultado.token,
        expira_em: resultado.expiraEm,
        usuario: resultado.usuario,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (erro) {
    registrarErro("login", erro);
    return respostaErro(500, "Erro interno");
  }
}
