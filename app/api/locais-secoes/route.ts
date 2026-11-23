import { NextResponse } from "next/server";

import { autorizar } from "@/lib/server/auth/guard";
import {
  inserirLocal,
  listarLocaisComSecoes,
} from "@/lib/server/db/locais-secoes";
import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import { criarLocalSchema } from "@/lib/server/validation/locais-secoes";

export async function GET(request: Request) {
  try {
    const acesso = await autorizar(request, {
      papeis: ["administrador"],
    });
    if (!acesso.ok) return acesso.resposta;

    return NextResponse.json(
      { data: await listarLocaisComSecoes() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (erro) {
    registrarErro("listar-locais-secoes", erro);
    return respostaErro(500, "Erro interno");
  }
}

export async function POST(request: Request) {
  try {
    const acesso = await autorizar(request, {
      papeis: ["administrador"],
    });
    if (!acesso.ok) return acesso.resposta;

    const entrada = criarLocalSchema.safeParse(await lerJson(request));
    if (!entrada.success) {
      return respostaErro(400, "Dados inválidos", {
        campos: camposDoErro(entrada.error),
      });
    }

    const local = await inserirLocal(entrada.data);
    return NextResponse.json({ data: local }, { status: 201 });
  } catch (erro) {
    registrarErro("criar-local-votacao", erro);
    return respostaErro(500, "Erro interno");
  }
}
