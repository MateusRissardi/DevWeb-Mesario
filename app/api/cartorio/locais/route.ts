import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { listarLocais } from "@/lib/server/db/cartorio";
import {
  listaLocaisSchema,
  paramsDaUrl,
} from "@/lib/server/validation/cartorio";

export async function GET(request: Request) {
  return comEquipe(request, "listar-locais", async () => {
    const entrada = listaLocaisSchema.safeParse(paramsDaUrl(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    const { pagina, limite, ...filtros } = entrada.data;
    return json(await listarLocais({ pagina, limite }, filtros));
  });
}
