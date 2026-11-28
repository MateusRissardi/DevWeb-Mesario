import { NextResponse } from "next/server";

import { codigoPg } from "@/lib/server/cartorio/rota";
import { autorizar } from "@/lib/server/auth/guard";
import {
  atualizarLocal,
  buscarLocalPorId,
  excluirLocal,
} from "@/lib/server/db/locais-secoes";
import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import {
  atualizarLocalSchema,
  idSchema,
} from "@/lib/server/validation/locais-secoes";

type Contexto = { params: Promise<{ id: string }> };

async function lerId(contexto: Contexto) {
  return idSchema.safeParse((await contexto.params).id);
}

export async function GET(request: Request, contexto: Contexto) {
  try {
    const acesso = await autorizar(request, { papeis: ["administrador"] });
    if (!acesso.ok) return acesso.resposta;

    const id = await lerId(contexto);
    if (!id.success) return respostaErro(400, "Identificador inválido");

    const local = await buscarLocalPorId(id.data);
    return local
      ? NextResponse.json({ data: local }, { headers: { "Cache-Control": "no-store" } })
      : respostaErro(404, "Local de votação não encontrado");
  } catch (erro) {
    registrarErro("consultar-local-votacao", erro);
    return respostaErro(500, "Erro interno");
  }
}

export async function PUT(request: Request, contexto: Contexto) {
  try {
    const acesso = await autorizar(request, { papeis: ["administrador"] });
    if (!acesso.ok) return acesso.resposta;

    const id = await lerId(contexto);
    if (!id.success) return respostaErro(400, "Identificador inválido");

    const entrada = atualizarLocalSchema.safeParse(await lerJson(request));
    if (!entrada.success) {
      return respostaErro(400, "Dados inválidos", {
        campos: camposDoErro(entrada.error),
      });
    }

    const local = await atualizarLocal(id.data, entrada.data);
    return local
      ? NextResponse.json({ data: local })
      : respostaErro(404, "Local de votação não encontrado");
  } catch (erro) {
    if (codigoPg(erro) === "23505") {
      return respostaErro(409, "Já existe um local com esse nome nessa zona");
    }
    registrarErro("atualizar-local-votacao", erro);
    return respostaErro(500, "Erro interno");
  }
}

export async function DELETE(request: Request, contexto: Contexto) {
  try {
    const acesso = await autorizar(request, { papeis: ["administrador"] });
    if (!acesso.ok) return acesso.resposta;

    const id = await lerId(contexto);
    if (!id.success) return respostaErro(400, "Identificador inválido");

    return (await excluirLocal(id.data))
      ? new NextResponse(null, { status: 204 })
      : respostaErro(404, "Local de votação não encontrado");
  } catch (erro) {
    if (codigoPg(erro) === "23503") {
      return respostaErro(409, "Há seções ou voluntários vinculados a este local. Remova-os antes.");
    }
    registrarErro("excluir-local-votacao", erro);
    return respostaErro(500, "Erro interno");
  }
}
