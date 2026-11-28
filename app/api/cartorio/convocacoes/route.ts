import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { listarConvocacoes } from "@/lib/server/db/cartorio";
import {
  listaConvocacoesSchema,
  paramsDaUrl,
} from "@/lib/server/validation/cartorio";

// Convocações: só o registro da situação. Nenhuma mensagem é enviada.
export async function GET(request: Request) {
  return comEquipe(request, "listar-convocacoes", async () => {
    const entrada = listaConvocacoesSchema.safeParse(paramsDaUrl(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    const { pagina, limite, ...filtros } = entrada.data;
    return json(await listarConvocacoes({ pagina, limite }, filtros));
  });
}
