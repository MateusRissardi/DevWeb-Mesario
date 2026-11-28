import { comEquipe } from "@/lib/server/cartorio/rota";
import { json } from "@/lib/server/cartorio/resposta";
import { painelCartorio } from "@/lib/server/db/cartorio";
import { sincronizarPendencias } from "@/lib/server/db/pendencias";

// Números da visão geral do cartório.
export async function GET(request: Request) {
  return comEquipe(request, "painel-cartorio", async () => {
    await sincronizarPendencias();
    return json(await painelCartorio());
  });
}
