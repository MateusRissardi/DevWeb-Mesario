import { comEquipe } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { detalheVoluntario } from "@/lib/server/db/voluntarios";
import { respostaErro } from "@/lib/server/http";

// Detalhe da manifestação: dados, validações, alocação atual e histórico.
export async function GET(request: Request, contexto: ContextoId) {
  return comEquipe(request, "detalhe-voluntario", async () => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const detalhe = await detalheVoluntario(id.id);
    return detalhe ? json({ data: detalhe }) : respostaErro(404, "Voluntário não encontrado");
  });
}
