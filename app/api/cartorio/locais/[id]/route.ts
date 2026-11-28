import { comEquipe } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { buscarLocal } from "@/lib/server/db/cartorio";
import { respostaErro } from "@/lib/server/http";

export async function GET(request: Request, contexto: ContextoId) {
  return comEquipe(request, "consultar-local", async () => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const local = await buscarLocal(id.id);
    return local ? json({ data: local }) : respostaErro(404, "Local não encontrado");
  });
}
