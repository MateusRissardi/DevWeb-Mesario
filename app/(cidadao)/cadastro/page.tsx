import { redirect } from "next/navigation";

/** O cadastro começa na etapa 1 (identificação). */
export default function CadastroPage() {
  redirect("/cadastro/dados");
}
