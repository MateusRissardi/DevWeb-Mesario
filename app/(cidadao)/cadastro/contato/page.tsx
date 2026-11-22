import GuardaCadastro from "@/components/auth/GuardaCadastro";
import ContatoForm from "@/components/cidadao/ContatoForm";
import Stepper from "@/components/cidadao/Stepper";

export default function CadastroContatoPage() {
  return (
    <GuardaCadastro>
      <Stepper atual={2} />
      <ContatoForm modo="cadastro" />
    </GuardaCadastro>
  );
}
