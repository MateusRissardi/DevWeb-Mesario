import { NextResponse } from "next/server";

import { lerJson, registrarErro, respostaErro } from "@/lib/server/http";
import { redefinirSenha } from "@/lib/server/services/senha";
import { camposDoErro } from "@/lib/server/validation/usuarios";
import { redefinirSenhaSchema } from "@/lib/server/validation/senha";

// Define a senha nova com o token recebido por e-mail (vale uma vez e expira).
export async function POST(request: Request) {
  const entrada = redefinirSenhaSchema.safeParse(await lerJson(request));
  if (!entrada.success) {
    return respostaErro(400, "Dados inválidos", {
      campos: camposDoErro(entrada.error),
    });
  }

  try {
    const trocada = await redefinirSenha(entrada.data.token, entrada.data.senha);
    if (!trocada) {
      return respostaErro(400, "Link inválido ou expirado. Peça um novo link.");
    }
    return NextResponse.json(
      { mensagem: "Senha alterada. Entre com a nova senha." },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (erro) {
    registrarErro("redefinir-senha", erro);
    return respostaErro(500, "Erro interno");
  }
}
