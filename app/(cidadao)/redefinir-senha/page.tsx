import flow from "@/components/cidadao/Flow.module.css";
import RedefinirSenhaForm from "@/components/cidadao/RedefinirSenhaForm";

export default function RedefinirSenhaPage() {
  return (
    <section className={flow.content} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">
        Nova senha
      </h1>

      <RedefinirSenhaForm />
    </section>
  );
}
