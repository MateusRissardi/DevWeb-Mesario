import { z } from "zod";

import { PAPEIS } from "@/lib/server/auth/tipos";
import type { CamposInvalidos } from "@/lib/server/http";

const email = z
  .string("Informe o e-mail")
  .trim()
  .toLowerCase()
  .max(254, "O e-mail deve ter no máximo 254 caracteres")
  .pipe(z.email("Informe um e-mail válido"));

const senhaForte = z
  .string("Informe a senha")
  .min(10, "A senha deve ter ao menos 10 caracteres")
  .refine(
    (valor) => Buffer.byteLength(valor, "utf8") <= 72,
    "A senha deve ter no máximo 72 bytes",
  )
  .regex(/[a-z]/, "A senha deve ter ao menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve ter ao menos um número");

function somenteDigitos(tamanho: number, mensagem: string) {
  return z
    .string(mensagem)
    .transform((valor) => valor.replace(/\D/g, ""))
    .pipe(z.string().length(tamanho, mensagem));
}

export const criarUsuarioSchema = z.object({
  email,
  senha: senhaForte,
  papel: z.enum(PAPEIS, "Papel inválido").optional(),
  cpf: somenteDigitos(11, "O CPF deve ter 11 dígitos").optional(),
  titulo_eleitor: somenteDigitos(
    12,
    "O título de eleitor deve ter 12 dígitos",
  ).optional(),
});

export const loginSchema = z.object({
  email,
  senha: z
    .string("Informe a senha")
    .min(1, "Informe a senha")
    .max(200, "Senha inválida"),
});

export type CriarUsuarioEntrada = z.infer<typeof criarUsuarioSchema>;

/** Converte os erros do zod em { campo: mensagem }, uma mensagem por campo. */
export function camposDoErro(erro: z.ZodError): CamposInvalidos {
  const campos: CamposInvalidos = {};
  for (const problema of erro.issues) {
    const chave = problema.path.join(".") || "corpo";
    if (!(chave in campos)) {
      campos[chave] = problema.message;
    }
  }
  return campos;
}
