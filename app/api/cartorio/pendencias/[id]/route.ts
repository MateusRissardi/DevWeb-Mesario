import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json, lerId, type ContextoId } from "@/lib/server/cartorio/resposta";
import { atualizarPendencia, buscarPendencia } from "@/lib/server/db/pendencias";
import { buscarSecao } from "@/lib/server/db/cartorio";
import { lerJson, respostaErro } from "@/lib/server/http";
import { acaoPendenciaSchema } from "@/lib/server/validation/cartorio";

// Detalhe: dados da pendência, histórico e, se for de seção, a composição da mesa.
export async function GET(request: Request, contexto: ContextoId) {
  return comEquipe(request, "buscar-pendencia", async () => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const pendencia = await buscarPendencia(id.id);
    if (!pendencia) return respostaErro(404, "Pendência não encontrada");
    const secao = pendencia.secao_id ? await buscarSecao(pendencia.secao_id) : null;
    return json({ data: { ...pendencia, secao_detalhe: secao } });
  });
}

const MENSAGENS = {
  nao_encontrada: [404, "Pendência não encontrada"],
  ja_resolvida: [409, "Esta pendência já foi resolvida"],
  ja_em_analise: [409, "Esta pendência já está em análise"],
  nao_manual: [409, "Esta pendência se resolve sozinha quando a situação for corrigida"],
} as const;

// "assumir" (põe em análise) ou "resolver" (só possível impedimento).
export async function PUT(request: Request, contexto: ContextoId) {
  return comEquipe(request, "atualizar-pendencia", async (usuario) => {
    const id = await lerId(contexto);
    if (!id.ok) return id.resposta;
    const entrada = acaoPendenciaSchema.safeParse(await lerJson(request));
    if (!entrada.success) return respostaInvalida(entrada.error);

    const r = await atualizarPendencia(id.id, entrada.data.acao, usuario.id);
    if (!r.ok) {
      const [status, mensagem] = MENSAGENS[r.motivo];
      return respostaErro(status, mensagem);
    }
    return json({ data: await buscarPendencia(id.id) });
  });
}
