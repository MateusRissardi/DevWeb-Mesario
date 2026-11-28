import { comEquipe } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { buscarSecao } from "@/lib/server/db/cartorio";
import { respostaErro } from "@/lib/server/http";

// Seção com a composição da mesa (4 funções + suplentes).
export async function GET(request: Request, contexto: ContextoId) {
  return comEquipe(request, "consultar-secao", async () => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const secao = await buscarSecao(id.id);
    return secao ? json({ data: secao }) : respostaErro(404, "Seção não encontrada");
  });
}
