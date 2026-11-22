import { createHash, randomBytes } from "node:crypto";

import { gerarHash } from "@/lib/server/auth/senha";
import {
  consumirRedefinicao,
  contarRecentes,
  criarRedefinicao,
} from "@/lib/server/db/redefinicoes";
import { buscarPorEmail } from "@/lib/server/db/usuarios";
import { enviarEmail } from "@/lib/server/email";

const VALIDADE_MINUTOS = 30;
const JANELA_MINUTOS = 15;
const MAX_PEDIDOS_NA_JANELA = 3;

const hashDoToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** Endereço público do site, para montar o link do e-mail. */
function enderecoDoSite(): string {
  const configurado = process.env.APP_URL;
  if (configurado) return configurado.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * Prepara a redefinição para o e-mail informado. Devolve a função que envia a
 * mensagem (para rodar depois da resposta) ou `null` se não há o que enviar:
 * e-mail sem conta ou pedidos demais. Quem chama responde sempre o mesmo texto,
 * para não revelar quais e-mails têm conta.
 *
 * O token vai só no e-mail, no fragmento (#) do link: o navegador não o envia ao
 * servidor nem em cabeçalhos de origem. No banco fica apenas o hash.
 */
export async function solicitarRedefinicao(
  email: string,
): Promise<(() => Promise<void>) | null> {
  const usuario = await buscarPorEmail(email);
  if (!usuario) return null;

  if ((await contarRecentes(usuario.id, JANELA_MINUTOS)) >= MAX_PEDIDOS_NA_JANELA) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  await criarRedefinicao(usuario.id, hashDoToken(token), VALIDADE_MINUTOS);

  const link = `${enderecoDoSite()}/redefinir-senha#token=${token}`;

  return () =>
    enviarEmail({
      para: usuario.email,
      assunto: "Redefinição de senha – Portal do Mesário",
      texto: [
        "Recebemos um pedido para redefinir a senha da sua conta no Portal do Mesário.",
        "",
        `Para escolher uma nova senha, abra o link abaixo (vale por ${VALIDADE_MINUTOS} minutos e só pode ser usado uma vez):`,
        link,
        "",
        "Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.",
      ].join("\n"),
    });
}

/** Troca a senha com o token recebido por e-mail. Devolve false se o link não vale mais. */
export async function redefinirSenha(
  token: string,
  novaSenha: string,
): Promise<boolean> {
  return consumirRedefinicao(hashDoToken(token), await gerarHash(novaSenha));
}
