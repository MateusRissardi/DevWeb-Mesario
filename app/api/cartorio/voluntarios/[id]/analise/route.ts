import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { analisarVoluntario, detalheVoluntario } from "@/lib/server/db/voluntarios";
import { lerJson, respostaErro } from "@/lib/server/http";
import { analiseSchema } from "@/lib/server/validation/cartorio";

// "iniciar" a análise ou "marcar_apta" (exige todas as validações).
export async function POST(request: Request, contexto: ContextoId) {
  return comEquipe(request, "analisar-voluntario", async (usuario) => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const entrada = analiseSchema.safeParse(await lerJson(request));
    if (!entrada.success) return respostaInvalida(entrada.error);

    const r = await analisarVoluntario(id.id, entrada.data.acao, usuario.id);
    if (!r.ok) {
      switch (r.motivo) {
        case "nao_encontrado":
          return respostaErro(404, "Voluntário não encontrado");
        case "ja_apta":
          return respostaErro(409, "Esta manifestação já está apta");
        case "ja_em_analise":
          return respostaErro(409, "Esta manifestação já está em análise");
        default:
          return json({ erro: "A manifestação não passou em todas as validações", validacoes: r.validacoes }, 409);
      }
    }
    return json({ data: await detalheVoluntario(id.id) });
  });
}
