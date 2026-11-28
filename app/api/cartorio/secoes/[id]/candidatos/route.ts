import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { buscarSecao, listarCandidatos } from "@/lib/server/db/cartorio";
import { respostaErro } from "@/lib/server/http";
import { candidatosSchema, paramsDaUrl } from "@/lib/server/validation/cartorio";

// Voluntários disponíveis para a seção, os mais compatíveis primeiro.
export async function GET(request: Request, contexto: ContextoId) {
  return comEquipe(request, "listar-candidatos", async () => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const entrada = candidatosSchema.safeParse(paramsDaUrl(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    if (!(await buscarSecao(id.id))) return respostaErro(404, "Seção não encontrada");
    const itens = await listarCandidatos(id.id, entrada.data.q);
    return json({ itens, total: itens.length });
  });
}
