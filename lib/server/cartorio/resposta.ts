import { NextResponse } from "next/server";

import { respostaErro } from "@/lib/server/http";
import { idSchema } from "@/lib/server/validation/cartorio";

export const SEM_CACHE = { headers: { "Cache-Control": "no-store" } } as const;

export const json = (dados: unknown, status = 200) =>
  NextResponse.json(dados, { status, headers: SEM_CACHE.headers });

export type ContextoId = { params: Promise<{ id: string }> };

/** Lê o :id da rota. Devolve a resposta 400 pronta se for inválido. */
export async function lerId(
  contexto: ContextoId,
): Promise<{ ok: true; id: number } | { ok: false; resposta: Response }> {
  const id = idSchema.safeParse((await contexto.params).id);
  return id.success
    ? { ok: true, id: id.data }
    : { ok: false, resposta: respostaErro(400, "Identificador inválido") };
}
