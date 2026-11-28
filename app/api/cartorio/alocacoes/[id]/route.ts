import { comEquipe } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { removerAlocacao } from "@/lib/server/db/cartorio";
import { respostaErro } from "@/lib/server/http";

// Remove a pré-seleção. A convocação fica no histórico como "cancelado".
export async function DELETE(request: Request, contexto: ContextoId) {
  return comEquipe(request, "remover-alocacao", async (usuario) => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    return (await removerAlocacao(id.id, usuario.id))
      ? json({ mensagem: "Alocação removida" })
      : respostaErro(404, "Alocação não encontrada");
  });
}
