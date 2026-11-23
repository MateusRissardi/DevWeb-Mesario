import { NextResponse } from "next/server";

import { autorizar } from "@/lib/server/auth/guard";
import {
  buscarLocalPorId,
  inserirSecao,
} from "@/lib/server/db/locais-secoes";
import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import {
  criarSecaoSchema,
  idSchema,
} from "@/lib/server/validation/locais-secoes";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(request: Request, contexto: Contexto) {
  try {
    const acesso = await autorizar(request, { papeis: ["administrador"] });
    if (!acesso.ok) return acesso.resposta;

    const id = idSchema.safeParse((await contexto.params).id);
    if (!id.success) return respostaErro(400, "Identificador inválido");

    const local = await buscarLocalPorId(id.data);
    return local
      ? NextResponse.json(
          { data: local.secoes },
          { headers: { "Cache-Control": "no-store" } },
        )
      : respostaErro(404, "Local de votação não encontrado");
  } catch (erro) {
    registrarErro("listar-secoes-local", erro);
    return respostaErro(500, "Erro interno");
  }
}

export async function POST(request: Request, contexto: Contexto) {
  try {
    const acesso = await autorizar(request, { papeis: ["administrador"] });
    if (!acesso.ok) return acesso.resposta;

    const id = idSchema.safeParse((await contexto.params).id);
    if (!id.success) return respostaErro(400, "Identificador inválido");

    const entrada = criarSecaoSchema.safeParse(await lerJson(request));
    if (!entrada.success) {
      return respostaErro(400, "Dados inválidos", {
        campos: camposDoErro(entrada.error),
      });
    }

    if (!(await buscarLocalPorId(id.data))) {
      return respostaErro(404, "Local de votação não encontrado");
    }

    const secao = await inserirSecao(id.data, entrada.data.numero_secao);
    return NextResponse.json({ data: secao }, { status: 201 });
  } catch (erro) {
    registrarErro("criar-secao", erro);
    return respostaErro(500, "Erro interno");
  }
}
