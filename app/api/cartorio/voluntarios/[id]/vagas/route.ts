import { comEquipe } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { vagasDoVoluntario } from "@/lib/server/db/voluntarios";
import { respostaErro } from "@/lib/server/http";

// Vagas abertas compatíveis com o voluntário (mesma zona; mesmo local primeiro).
export async function GET(request: Request, contexto: ContextoId) {
  return comEquipe(request, "vagas-do-voluntario", async () => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const r = await vagasDoVoluntario(id.id);
    if (r.ok) return json({ itens: r.itens, total: r.itens.length });
    return r.motivo === "nao_encontrado"
      ? respostaErro(404, "Voluntário não encontrado")
      : respostaErro(
          409,
          r.motivo === "ja_alocado"
            ? "Este voluntário já está alocado"
            : r.motivo === "nao_apta"
              ? "A manifestação ainda não foi marcada como apta"
              : "Este voluntário retirou o interesse",
        );
  });
}
