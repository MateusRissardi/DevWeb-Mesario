import EsqueciSenhaForm from "@/components/cidadao/EsqueciSenhaForm";
import flow from "@/components/cidadao/Flow.module.css";

export default function EsqueciSenhaPage() {
  return (
    <section className={flow.content} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">
        Esqueci minha senha
      </h1>

      <p className={flow.text}>
        Informe o e-mail da sua conta. Enviaremos um link para você escolher uma
        nova senha.
      </p>

      <EsqueciSenhaForm />
    </section>
  );
}
