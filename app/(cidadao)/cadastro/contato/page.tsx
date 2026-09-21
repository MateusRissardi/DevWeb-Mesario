import ContatoForm from "@/components/cidadao/ContatoForm";
import Stepper from "@/components/cidadao/Stepper";

export default function CadastroContatoPage() {
  return (
    <>
      <Stepper atual={3} />
      <ContatoForm modo="cadastro" />
    </>
  );
}
