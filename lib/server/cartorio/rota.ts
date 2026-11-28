import { autorizar } from "@/lib/server/auth/guard";
import type { UsuarioPublico } from "@/lib/server/auth/tipos";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import { registrarErro, respostaErro } from "@/lib/server/http";
import type { z } from "zod";

/**
 * Casca das rotas do cartório: exige login (401) e papel cartório ou
 * administrador (403), e trata erro inesperado como 500 sem vazar detalhes.
 */
export async function comEquipe(
  request: Request,
  contexto: string,
  tratar: (usuario: UsuarioPublico) => Promise<Response>,
): Promise<Response> {
  const acesso = await autorizar(request, {
    papeis: ["cartorio", "administrador"],
  });
  if (!acesso.ok) return acesso.resposta;

  try {
    return await tratar(acesso.usuario);
  } catch (erro) {
    registrarErro(contexto, erro);
    return respostaErro(500, "Erro interno");
  }
}

export function respostaInvalida(erro: z.ZodError) {
  return respostaErro(400, "Dados inválidos", { campos: camposDoErro(erro) });
}

/** Código de erro do Postgres, se houver. */
export function codigoPg(erro: unknown): string | undefined {
  const { code } = (erro ?? {}) as { code?: unknown };
  return typeof code === "string" ? code : undefined;
}

export function restricaoPg(erro: unknown): string | undefined {
  const { constraint } = (erro ?? {}) as { constraint?: unknown };
  return typeof constraint === "string" ? constraint : undefined;
}
