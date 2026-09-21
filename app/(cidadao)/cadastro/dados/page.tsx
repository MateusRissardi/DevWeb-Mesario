import flow from "@/components/cidadao/Flow.module.css";
import IdentificacaoForm from "@/components/cidadao/IdentificacaoForm";
import Stepper from "@/components/cidadao/Stepper";
import WizardNav from "@/components/cidadao/WizardNav";

const FORM_ID = "form-identificacao";

export default function CadastroDadosPage() {
  return (
    <>
      <Stepper atual={1} />

      <section className={flow.content} aria-labelledby="titulo-etapa">
        <h1 className={flow.sectionTitle} id="titulo-etapa">
          Identificação
        </h1>

        <p className={flow.text}>
          Para se voluntariar, informe seu CPF ou nº do título e o código de
          autenticação gerado pelo aplicativo e-Título.
        </p>

        <IdentificacaoForm id={FORM_ID} modo="cadastro" />
      </section>

      <WizardNav formId={FORM_ID} />
    </>
  );
}
