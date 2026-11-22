import { NextResponse } from "next/server";

export type CamposInvalidos = Record<string, string>;

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

export async function lerJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function ipDaRequisicao(request: Request): string | null {
  const encaminhado = request.headers.get("x-forwarded-for");
  const ip = encaminhado?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  return ip ? ip.slice(0, 45) : null;
}

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
