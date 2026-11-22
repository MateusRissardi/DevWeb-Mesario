import { after, NextResponse } from "next/server";

import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import { solicitarRedefinicao } from "@/lib/server/services/senha";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import { esqueciSenhaSchema } from "@/lib/server/validation/senha";

const RESPOSTA = {
  mensagem:
    "Se este e-mail tiver uma conta, enviaremos um link para redefinir a senha.",
};

// Pede o link de redefinição. A resposta é sempre a mesma, tenha o e-mail conta ou não.
export async function POST(request: Request) {
  const entrada = esqueciSenhaSchema.safeParse(await lerJson(request));
  if (!entrada.success) {
    return respostaErro(400, "Dados inválidos", {
      campos: camposDoErro(entrada.error),
    });
  }

  try {
    const enviar = await solicitarRedefinicao(entrada.data.email);
    if (enviar) {
      // Depois da resposta: o tempo de envio não denuncia se o e-mail tem conta.
      after(async () => {
        try {
          await enviar();
        } catch (erro) {
          registrarErro("enviar-redefinicao", erro);
        }
      });
    }
    return NextResponse.json(RESPOSTA, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (erro) {
    registrarErro("solicitar-redefinicao", erro);
    return respostaErro(500, "Erro interno");
  }
}
