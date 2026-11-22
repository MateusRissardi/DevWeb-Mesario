import GuardaCadastro from "@/components/auth/GuardaCadastro";
import AceiteForm from "@/components/cidadao/AceiteForm";
import Stepper from "@/components/cidadao/Stepper";

export default function CadastroAceitePage() {
  return (
    <GuardaCadastro>
      <Stepper atual={3} />
      <AceiteForm />
    </GuardaCadastro>
  );
}
