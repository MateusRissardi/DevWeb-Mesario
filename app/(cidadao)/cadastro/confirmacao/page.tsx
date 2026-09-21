import DadosEleitorForm from "@/components/cidadao/DadosEleitorForm";
import Stepper from "@/components/cidadao/Stepper";

export default function CadastroConfirmacaoPage() {
  return (
    <>
      <Stepper atual={2} />
      <DadosEleitorForm />
    </>
  );
}
