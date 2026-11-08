import { NextResponse } from "next/server";

import { autorizar } from "@/lib/server/auth/guard";
import { ehDono, ehEquipe } from "@/lib/server/auth/posse";
import {
  atualizarMesario,
  buscarMesarioPorId,
  excluirMesario,
} from "@/lib/server/db/mesarios";
import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import {
  atualizarMesarioSchema,
  idSchema,
} from "@/lib/server/validation/mesarios";
import { camposDoErro } from "@/lib/server/validation/usuarios";

type Contexto = { params: Promise<{ id: string }> };

const SEM_PERMISSAO = "Sem permissão para acessar este cadastro";

async function lerId(contexto: Contexto) {
  return idSchema.safeParse((await contexto.params).id);
}

// Consulta um cadastro. O dono (mesário) ou o cartório.
export async function GET(request: Request, contexto: Contexto) {
  try {
    const id = await lerId(contexto);
    if (!id.success) {
      return respostaErro(400, "Identificador inválido");
    }

    const acesso = await autorizar(request);
    if (!acesso.ok) {
      return acesso.resposta;
    }
    if (!ehEquipe(acesso.usuario) && !ehDono(acesso.usuario, id.data)) {
      return respostaErro(403, SEM_PERMISSAO);
    }

    const mesario = await buscarMesarioPorId(id.data);
    return mesario
      ? NextResponse.json({ data: mesario })
      : respostaErro(404, "Mesário não encontrado");
  } catch (erro) {
    registrarErro("consultar-mesario", erro);
    return respostaErro(500, "Erro interno");
  }
}

// Atualiza contato e interesse. O dono (mesário) ou o cartório.
// O mesário só pode retirar o interesse; reativar fica com o cartório.
export async function PUT(request: Request, contexto: Contexto) {
  try {
    const id = await lerId(contexto);
    if (!id.success) {
      return respostaErro(400, "Identificador inválido");
    }

    const acesso = await autorizar(request);
    if (!acesso.ok) {
      return acesso.resposta;
    }
    if (!ehEquipe(acesso.usuario) && !ehDono(acesso.usuario, id.data)) {
      return respostaErro(403, SEM_PERMISSAO);
    }

    const entrada = atualizarMesarioSchema.safeParse(await lerJson(request));
    if (!entrada.success) {
      return respostaErro(400, "Dados inválidos", {
        campos: camposDoErro(entrada.error),
      });
    }

    if (!ehEquipe(acesso.usuario) && entrada.data.status_interesse === true) {
      return respostaErro(403, "Para reativar o interesse, procure o cartório");
    }

    const mesario = await atualizarMesario(id.data, entrada.data);
    return mesario
      ? NextResponse.json({ data: mesario })
      : respostaErro(404, "Mesário não encontrado");
  } catch (erro) {
    registrarErro("atualizar-mesario", erro);
    return respostaErro(500, "Erro interno");
  }
}

// Exclui o cadastro. Só administrador.
export async function DELETE(request: Request, contexto: Contexto) {
  try {
    const id = await lerId(contexto);
    if (!id.success) {
      return respostaErro(400, "Identificador inválido");
    }

    const acesso = await autorizar(request, { papeis: ["administrador"] });
    if (!acesso.ok) {
      return acesso.resposta;
    }

    return (await excluirMesario(id.data))
      ? new NextResponse(null, { status: 204 })
      : respostaErro(404, "Mesário não encontrado");
  } catch (erro) {
    const { code } = erro as { code?: string };
    if (code === "23503") {
      return respostaErro(
        409,
        "Existe uma conta de acesso ligada a este cadastro",
      );
    }
    registrarErro("excluir-mesario", erro);
    return respostaErro(500, "Erro interno");
  }
}
