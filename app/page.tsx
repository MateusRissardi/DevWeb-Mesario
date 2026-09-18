import FooterGov from "@/components/layout/FooterGov";
import HeaderGov from "@/components/layout/HeaderGov";
import VolunteerHeader from "@/components/pages/VolunteerHeader";
import VolunteerInformation from "@/components/pages/VolunteerInformation";
import StatusBadge, { StatusBadgeType } from "@/components/cartorio/StatusBadge";

export default function Page() {
  return (
    <>
      <HeaderGov />

      <main id="conteudo-principal">
        <VolunteerHeader />
        <VolunteerInformation />
        <StatusBadge status={StatusBadgeType.PrioridadeCritica} />
      </main>

      <FooterGov />
    </>
  );
}