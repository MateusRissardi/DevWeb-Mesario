import { NextResponse } from "next/server";

import { autorizar } from "@/lib/server/auth/guard";
import {
  atualizarLocal,
  buscarLocalPorId,
  ehSecaoReferenciadaPorAlocacao,
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
    if (ehSecaoReferenciadaPorAlocacao(erro)) {
      return respostaErro(
        409,
        "Não é possível excluir este local porque uma ou mais seções possuem alocações vinculadas. Remova ou transfira as alocações antes de tentar novamente.",
      );
    }

    registrarErro("excluir-local-votacao", erro);
    return respostaErro(500, "Erro interno");
  }
}
