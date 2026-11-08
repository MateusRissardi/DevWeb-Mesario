import CriarContaForm from "@/components/cidadao/CriarContaForm";
import flow from "@/components/cidadao/Flow.module.css";

export default function CriarContaPage() {
  return (
    <section className={flow.content} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">
        Criar conta
      </h1>

      <p className={flow.text}>
        Crie seu acesso com e-mail e senha. Depois de entrar, você faz o
        cadastro como voluntário. Se já fez o cadastro, informe CPF e título
        para ligar a conta a ele.
      </p>

      <CriarContaForm />
    </section>
  );
}
