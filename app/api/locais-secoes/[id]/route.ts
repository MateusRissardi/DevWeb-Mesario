import { NextResponse } from "next/server";

import { codigoPg } from "@/lib/server/cartorio/rota";
import { autorizar } from "@/lib/server/auth/guard";
import {
  atualizarSecao,
  buscarSecaoPorId,
  excluirSecao,
} from "@/lib/server/db/locais-secoes";
import {
  lerJson,
  registrarErro,
  respostaErro,
} from "@/lib/server/http";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import {
  atualizarSecaoSchema,
  idSchema,
} from "@/lib/server/validation/locais-secoes";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(request: Request, contexto: Contexto) {
  try {
    const id = idSchema.safeParse((await contexto.params).id);
    if (!id.success) {
      return respostaErro(400, "Identificador inválido");
    }

    const acesso = await autorizar(request, {
      papeis: ["administrador"],
    });
    if (!acesso.ok) {
      return acesso.resposta;
    }

    const secao = await buscarSecaoPorId(id.data);
    if (!secao) {
      return respostaErro(404, "Seção não encontrada");
    }

    return NextResponse.json(
      {
        data: {
          id: secao.id,
          numero_secao: secao.numero_secao,
          criado_em: secao.criado_em,
          local: {
            id: secao.local_id,
            nome: secao.nome,
            endereco: secao.endereco,
            bairro: secao.bairro,
            cidade: secao.cidade,
            uf: secao.uf,
            zona_eleitoral: secao.zona_eleitoral,
          },
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (erro) {
    registrarErro("consultar-secao", erro);
    return respostaErro(500, "Erro interno");
  }
}

export async function PUT(request: Request, contexto: Contexto) {
  try {
    const acesso = await autorizar(request, {
      papeis: ["administrador"],
    });
    if (!acesso.ok) return acesso.resposta;

    const id = idSchema.safeParse((await contexto.params).id);
    if (!id.success) return respostaErro(400, "Identificador inválido");

    const entrada = atualizarSecaoSchema.safeParse(await lerJson(request));
    if (!entrada.success) {
      return respostaErro(400, "Dados inválidos", {
        campos: camposDoErro(entrada.error),
      });
    }

    const secao = await atualizarSecao(id.data, entrada.data.numero_secao);
    return secao
      ? NextResponse.json({ data: secao })
      : respostaErro(404, "Seção não encontrada");
  } catch (erro) {
    if (codigoPg(erro) === "23505") {
      return respostaErro(409, "Já existe uma seção com esse número neste local");
    }
    registrarErro("atualizar-secao", erro);
    return respostaErro(500, "Erro interno");
  }
}

export async function DELETE(request: Request, contexto: Contexto) {
  try {
    const acesso = await autorizar(request, {
      papeis: ["administrador"],
    });
    if (!acesso.ok) return acesso.resposta;

    const id = idSchema.safeParse((await contexto.params).id);
    if (!id.success) return respostaErro(400, "Identificador inválido");

    return (await excluirSecao(id.data))
      ? new NextResponse(null, { status: 204 })
      : respostaErro(404, "Seção não encontrada");
  } catch (erro) {
    if (codigoPg(erro) === "23503") {
      return respostaErro(409, "Há voluntários alocados a esta seção. Remova as alocações antes.");
    }
    registrarErro("excluir-secao", erro);
    return respostaErro(500, "Erro interno");
  }
}
