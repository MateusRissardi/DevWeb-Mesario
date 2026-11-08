import { NextResponse } from "next/server";

export type CamposInvalidos = Record<string, string>;

/** Resposta de erro no formato { erro, campos? } usado pelas rotas novas. */
export function respostaErro(
  status: number,
  erro: string,
  opcoes: { campos?: CamposInvalidos; headers?: HeadersInit } = {},
) {
  return NextResponse.json(
    opcoes.campos ? { erro, campos: opcoes.campos } : { erro },
    { status, headers: opcoes.headers },
  );
}

/** Lê o corpo JSON. Devolve undefined se o corpo não for JSON válido. */
export async function lerJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/** IP do cliente. Na Vercel, o primeiro item de x-forwarded-for é o do cliente. */
export function ipDaRequisicao(request: Request): string | null {
  const encaminhado = request.headers.get("x-forwarded-for");
  const ip = encaminhado?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  return ip ? ip.slice(0, 45) : null;
}

/** Registra só o tipo e a mensagem do erro, nunca o corpo da requisição. */
export function registrarErro(contexto: string, erro: unknown) {
  if (erro instanceof Error) {
    const codigo = (erro as { code?: unknown }).code;
    console.error(
      `[${contexto}] ${erro.name}${typeof codigo === "string" ? ` (${codigo})` : ""}: ${erro.message}`,
    );
    return;
  }
  console.error(`[${contexto}] erro desconhecido`);
}
