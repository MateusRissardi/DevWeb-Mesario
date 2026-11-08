import CriarContaForm from "@/components/cidadao/CriarContaForm";
import flow from "@/components/cidadao/Flow.module.css";

export default function CriarContaPage() {
  return (
    <section className={flow.content} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">
        Criar conta
      </h1>

      <p className={flow.text}>
        Crie seu acesso para consultar e atualizar sua manifestação de
        interesse. É preciso já ter feito o cadastro como voluntário.
      </p>

      <CriarContaForm />
    </section>
  );
}
