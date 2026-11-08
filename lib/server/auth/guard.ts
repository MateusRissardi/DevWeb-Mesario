import type { NextResponse } from "next/server";

import { buscarPublicoPorId } from "@/lib/server/db/usuarios";
import { respostaErro } from "@/lib/server/http";

import type { Papel, UsuarioPublico } from "./tipos";
import { verificarToken } from "./token";

export type ResultadoAutorizacao =
  | { ok: true; usuario: UsuarioPublico }
  | { ok: false; resposta: NextResponse };

export type ResultadoAutorizacaoOpcional =
  | { ok: true; usuario: UsuarioPublico | null }
  | { ok: false; resposta: NextResponse };

function naoAutenticado(mensagem: string): {
  ok: false;
  resposta: NextResponse;
} {
  return {
    ok: false,
    resposta: respostaErro(401, mensagem, {
      headers: { "WWW-Authenticate": "Bearer" },
    }),
  };
}

async function usuarioDoToken(
  cabecalho: string,
): Promise<UsuarioPublico | null> {
  const partes = /^Bearer\s+(\S+)$/i.exec(cabecalho.trim());
  const id = partes ? await verificarToken(partes[1]) : null;
  return id === null ? null : buscarPublicoPorId(id);
}

/**
 * Exige token válido (401 se faltar, for inválido ou tiver expirado) e,
 * se informado, um dos papéis permitidos (403 se o papel não bastar).
 * O papel vem do banco a cada requisição, não do token.
 */
export async function autorizar(
  request: Request,
  opcoes: { papeis?: readonly Papel[] } = {},
): Promise<ResultadoAutorizacao> {
  const cabecalho = request.headers.get("authorization");
  if (!cabecalho) {
    return naoAutenticado("Autenticação necessária");
  }

  const usuario = await usuarioDoToken(cabecalho);
  if (!usuario) {
    return naoAutenticado("Token inválido ou expirado");
  }

  if (opcoes.papeis && !opcoes.papeis.includes(usuario.papel)) {
    return {
      ok: false,
      resposta: respostaErro(403, "Sem permissão para esta ação"),
    };
  }

  return { ok: true, usuario };
}

/** Como autorizar, mas sem token a requisição segue como anônima. Token presente e inválido continua sendo 401. */
export async function autorizarOpcional(
  request: Request,
): Promise<ResultadoAutorizacaoOpcional> {
  if (!request.headers.get("authorization")) {
    return { ok: true, usuario: null };
  }
  return autorizar(request);
}
