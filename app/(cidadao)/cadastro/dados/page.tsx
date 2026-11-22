import GuardaCadastro from "@/components/auth/GuardaCadastro";
import DadosEleitorForm from "@/components/cidadao/DadosEleitorForm";
import Stepper from "@/components/cidadao/Stepper";

export default function CadastroDadosPage() {
  return (
    <GuardaCadastro>
      <Stepper atual={1} />
      <DadosEleitorForm />
    </GuardaCadastro>
  );
}
