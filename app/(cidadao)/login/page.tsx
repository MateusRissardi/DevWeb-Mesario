import flow from "@/components/cidadao/Flow.module.css";
import LoginForm from "@/components/cidadao/LoginForm";

export default function LoginPage() {
  return (
    <section className={flow.content} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">
        Acessar o portal
      </h1>

      <p className={flow.text}>
        Entre com seu e-mail e senha para consultar ou atualizar sua
        manifestação de interesse.
      </p>

      <LoginForm />
    </section>
  );
}
