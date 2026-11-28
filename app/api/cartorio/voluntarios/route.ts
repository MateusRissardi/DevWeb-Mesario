import { comEquipe, respostaInvalida } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { listarVoluntarios } from "@/lib/server/db/cartorio";
import {
  listaVoluntariosSchema,
  paramsDaUrl,
} from "@/lib/server/validation/cartorio";

// Lista voluntários (manifestações), com busca, filtros e paginação.
export async function GET(request: Request) {
  return comEquipe(request, "listar-voluntarios", async () => {
    const entrada = listaVoluntariosSchema.safeParse(paramsDaUrl(request));
    if (!entrada.success) return respostaInvalida(entrada.error);
    const { pagina, limite, ...filtros } = entrada.data;
    return json(await listarVoluntarios({ pagina, limite }, filtros));
  });
}
