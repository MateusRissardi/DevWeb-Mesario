import AceiteForm from "@/components/cidadao/AceiteForm";
import Stepper from "@/components/cidadao/Stepper";

export default function CadastroAceitePage() {
  return (
    <>
      <Stepper atual={4} />
      <AceiteForm />
    </>
  );
}
