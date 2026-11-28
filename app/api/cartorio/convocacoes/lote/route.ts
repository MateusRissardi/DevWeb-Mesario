import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { convocarEmLote } from "@/lib/server/db/cartorio";
import { lerJson } from "@/lib/server/http";
import { loteConvocacoesSchema } from "@/lib/server/validation/cartorio";

// Marca várias convocações pendentes como "convocado" (registro; sem envio).
export async function POST(request: Request) {
  return comEquipe(request, "convocar-lote", async (usuario) => {
    const entrada = loteConvocacoesSchema.safeParse(await lerJson(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    return json(await convocarEmLote(entrada.data.ids, usuario.id));
  });
}
