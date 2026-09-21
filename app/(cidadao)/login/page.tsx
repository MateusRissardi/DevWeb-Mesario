import flow from "@/components/cidadao/Flow.module.css";
import IdentificacaoForm from "@/components/cidadao/IdentificacaoForm";

export default function LoginPage() {
  return (
    <section className={flow.content} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">
        Acessar o portal
      </h1>

      <p className={flow.text}>
        Para consultar ou atualizar sua manifestação de interesse, informe seu
        CPF ou nº do título e o código de autenticação gerado pelo aplicativo
        e-Título.
      </p>

      <IdentificacaoForm id="form-login" modo="login" botao="Entrar" />
    </section>
  );
}
