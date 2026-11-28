import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { atualizarConvocacao } from "@/lib/server/db/cartorio";
import { lerJson, respostaErro } from "@/lib/server/http";
import { atualizarConvocacaoSchema } from "@/lib/server/validation/cartorio";

// Registra a situação da convocação (convocado, confirmado, recusado...).
export async function PUT(request: Request, contexto: ContextoId) {
  return comEquipe(request, "atualizar-convocacao", async (usuario) => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const entrada = atualizarConvocacaoSchema.safeParse(await lerJson(request));
    if (!entrada.success) return respostaInvalida(entrada.error);

    const r = await atualizarConvocacao(
      id.id,
      entrada.data.status,
      entrada.data.observacao,
      usuario.id,
    );
    if (r.ok) return json({ data: r.convocacao });
    return r.motivo === "nao_encontrada"
      ? respostaErro(404, "Convocação não encontrada")
      : respostaErro(409, "A alocação desta convocação foi removida; ela só pode ficar cancelada");
  });
}
