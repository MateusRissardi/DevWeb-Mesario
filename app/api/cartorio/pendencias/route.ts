import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { listarPendencias, registrarImpedimento, sincronizarPendencias } from "@/lib/server/db/pendencias";
import { lerJson, respostaErro } from "@/lib/server/http";
import {
  impedimentoSchema,
  listaPendenciasSchema,
  paramsDaUrl,
} from "@/lib/server/validation/cartorio";

// Pendências: o sistema abre e encerra as automáticas a cada consulta.
export async function GET(request: Request) {
  return comEquipe(request, "listar-pendencias", async () => {
    const entrada = listaPendenciasSchema.safeParse(paramsDaUrl(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    await sincronizarPendencias();
    const { pagina, limite, ...filtros } = entrada.data;
    return json(await listarPendencias({ pagina, limite }, filtros));
  });
}

// Registra um possível impedimento para um voluntário (única pendência criada por pessoa).
export async function POST(request: Request) {
  return comEquipe(request, "registrar-impedimento", async (usuario) => {
    const entrada = impedimentoSchema.safeParse(await lerJson(request));
    if (!entrada.success) return respostaInvalida(entrada.error);

    const r = await registrarImpedimento(entrada.data.mesario_id, entrada.data.contexto, usuario.id);
    if (!r.ok) {
      return r.motivo === "mesario_nao_encontrado"
        ? respostaErro(404, "Voluntário não encontrado")
        : respostaErro(409, "Já existe um possível impedimento aberto para este voluntário");
    }
    return json({ id: r.id }, 201);
  });
}
