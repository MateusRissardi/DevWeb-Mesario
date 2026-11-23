import LocationsSectionsFlow from "@/components/cartorio/LocationsSectionsFlow";
import GuardaAcesso from "@/components/auth/GuardaAcesso";

export default function LocaisSecoesPage() {
  return (
    <GuardaAcesso
      papeis={["administrador"]}
      destinoSemPermissao="/cartorio"
    >
      <LocationsSectionsFlow />
    </GuardaAcesso>
  );
}
