import { NextResponse } from "next/server";

import { autorizar, autorizarOpcional } from "@/lib/server/auth/guard";
import { listarPublicos } from "@/lib/server/db/usuarios";
import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import { criarConta } from "@/lib/server/services/auth";
import {
  camposDoErro,
  criarUsuarioSchema,
} from "@/lib/server/validation/usuarios";

// Cadastro de conta. Pública para contas de mesário (com CPF e título de um
// cadastro existente); qualquer outro papel exige um administrador.
export async function POST(request: Request) {
  const entrada = criarUsuarioSchema.safeParse(await lerJson(request));
  if (!entrada.success) {
    return respostaErro(400, "Dados inválidos", {
      campos: camposDoErro(entrada.error),
    });
  }

  try {
    const chamador = await autorizarOpcional(request);
    if (!chamador.ok) {
      return chamador.resposta;
    }

    const resultado = await criarConta(entrada.data, chamador.usuario);
    if (!resultado.ok) {
      return respostaErro(resultado.status, resultado.erro, {
        campos: resultado.campos,
      });
    }

    return NextResponse.json({ usuario: resultado.usuario }, { status: 201 });
  } catch (erro) {
    registrarErro("criar-usuario", erro);
    return respostaErro(500, "Erro interno");
  }
}

// Lista as contas. Só administrador.
export async function GET(request: Request) {
  try {
    const acesso = await autorizar(request, { papeis: ["administrador"] });
    if (!acesso.ok) {
      return acesso.resposta;
    }

    return NextResponse.json({ usuarios: await listarPublicos() });
  } catch (erro) {
    registrarErro("listar-usuarios", erro);
    return respostaErro(500, "Erro interno");
  }
}
