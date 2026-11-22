import { z } from "zod";

import { email, senhaForte } from "./usuarios";

export const esqueciSenhaSchema = z.object({ email });

export const redefinirSenhaSchema = z.object({
  token: z
    .string("O link de redefinição é inválido")
    .min(20, "O link de redefinição é inválido")
    .max(200, "O link de redefinição é inválido"),
  senha: senhaForte,
});
