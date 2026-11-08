import { NextResponse } from "next/server";

import { autorizar, autorizarOpcional } from "@/lib/server/auth/guard";
import {
  buscarMesarioPorCpf,
  inserirMesario,
  listarMesarios,
} from "@/lib/server/db/mesarios";
import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import { criarMesarioSchema } from "@/lib/server/validation/mesarios";

const LIMITE_PADRAO = 50;
const LIMITE_MAXIMO = 200;

function inteiroPositivo(valor: string | null, padrao: number) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : padrao;
}

// Lista os cadastros, ou um só com ?cpf=. Só cartório e administrador.
export async function GET(request: Request) {
  try {
    const acesso = await autorizar(request, {
      papeis: ["cartorio", "administrador"],
    });
    if (!acesso.ok) {
      return acesso.resposta;
    }

    const parametros = new URL(request.url).searchParams;
    const cpfInformado = parametros.get("cpf");

    if (cpfInformado !== null) {
      const cpf = cpfInformado.replace(/\D/g, "");
      if (cpf.length !== 11) {
        return respostaErro(400, "Informe um CPF válido", {
          campos: { cpf: "O CPF deve ter 11 dígitos" },
        });
      }

      const mesario = await buscarMesarioPorCpf(cpf);
      return mesario
        ? NextResponse.json({ data: mesario })
        : respostaErro(404, "Mesário não encontrado");
    }

    const limite = Math.min(
      inteiroPositivo(parametros.get("limite"), LIMITE_PADRAO),
      LIMITE_MAXIMO,
    );
    const pagina = inteiroPositivo(parametros.get("pagina"), 1);
    const { itens, total } = await listarMesarios(
      limite,
      (pagina - 1) * limite,
    );

    return NextResponse.json({ data: itens, total, pagina, limite });
  } catch (erro) {
    registrarErro("listar-mesarios", erro);
    return respostaErro(500, "Erro interno");
  }
}

// Manifestação de interesse. Pública, como o cadastro do cidadão sempre foi.
// Se quem envia está logado com uma conta de mesário sem cadastro, a conta é
// ligada ao novo cadastro.
export async function POST(request: Request) {
  const entrada = criarMesarioSchema.safeParse(await lerJson(request));
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

    const contaDeMesario =
      chamador.usuario?.papel === "mesario" ? chamador.usuario : null;
    if (contaDeMesario?.mesario_id != null) {
      return respostaErro(409, "Sua conta já está ligada a um cadastro");
    }

    const mesario = await inserirMesario(
      entrada.data,
      contaDeMesario?.id ?? null,
    );
    if (!mesario) {
      return respostaErro(409, "Sua conta já está ligada a um cadastro");
    }
    return NextResponse.json({ data: mesario }, { status: 201 });
  } catch (erro) {
    const { code, constraint } = erro as { code?: string; constraint?: string };
    if (code === "23505") {
      return respostaErro(
        409,
        constraint === "mesarios_titulo_eleitor_key"
          ? "Já existe um cadastro com este título de eleitor"
          : "Já existe um cadastro com este CPF",
      );
    }
    registrarErro("criar-mesario", erro);
    return respostaErro(500, "Erro interno");
  }
}
