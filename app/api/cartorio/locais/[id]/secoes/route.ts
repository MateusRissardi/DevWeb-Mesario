import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { buscarLocal, listarSecoes } from "@/lib/server/db/cartorio";
import { respostaErro } from "@/lib/server/http";
import {
  listaSecoesSchema,
  paramsDaUrl,
} from "@/lib/server/validation/cartorio";

export async function GET(request: Request, contexto: ContextoId) {
  return comEquipe(request, "listar-secoes", async () => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const entrada = listaSecoesSchema.safeParse(paramsDaUrl(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    if (!(await buscarLocal(id.id))) return respostaErro(404, "Local não encontrado");
    const { pagina, limite, ...filtros } = entrada.data;
    return json(await listarSecoes(id.id, { pagina, limite }, filtros));
  });
}
