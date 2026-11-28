import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { criarAlocacao, listarAlocacoes } from "@/lib/server/db/cartorio";
import { lerJson, respostaErro } from "@/lib/server/http";
import {
  alocacaoSchema,
  listaAlocacoesSchema,
  paramsDaUrl,
} from "@/lib/server/validation/cartorio";

// Seleção: lista as alocações (pré-selecionados e selecionados).
export async function GET(request: Request) {
  return comEquipe(request, "listar-alocacoes", async () => {
    const entrada = listaAlocacoesSchema.safeParse(paramsDaUrl(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    const { pagina, limite, ...filtros } = entrada.data;
    return json(await listarAlocacoes({ pagina, limite }, filtros));
  });
}

const MENSAGENS = {
  mesario_nao_encontrado: [404, "Voluntário não encontrado"],
  secao_nao_encontrada: [404, "Seção não encontrada"],
  interesse_retirado: [409, "Este voluntário retirou o interesse"],
  nao_apta: [409, "A manifestação ainda não foi marcada como apta"],
  mesario_ja_alocado: [409, "Este voluntário já está alocado em uma seção"],
  funcao_ocupada: [409, "Esta função já está preenchida na seção"],
} as const;

// Pré-seleciona o voluntário para uma função numa seção (e abre a convocação pendente).
export async function POST(request: Request) {
  return comEquipe(request, "criar-alocacao", async (usuario) => {
    const entrada = alocacaoSchema.safeParse(await lerJson(request));
    if (!entrada.success) return respostaInvalida(entrada.error);

    const resultado = await criarAlocacao(entrada.data, usuario.id);
    if (!resultado.ok) {
      const [status, mensagem] = MENSAGENS[resultado.motivo];
      return respostaErro(status, mensagem);
    }
    return json({ id: resultado.id }, 201);
  });
}
