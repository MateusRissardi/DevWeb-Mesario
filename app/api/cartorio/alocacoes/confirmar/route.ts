import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { confirmarSelecoes } from "@/lib/server/db/cartorio";
import { lerJson } from "@/lib/server/http";
import { confirmarSelecoesSchema } from "@/lib/server/validation/cartorio";

// Confirma pré-seleções (viram "selecionado"). Quem retirou o interesse fica bloqueado.
export async function POST(request: Request) {
  return comEquipe(request, "confirmar-selecoes", async (usuario) => {
    const entrada = confirmarSelecoesSchema.safeParse(await lerJson(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    return json(await confirmarSelecoes([...new Set(entrada.data.ids)], usuario.id));
  });
}
