import FooterGov from "@/components/layout/FooterGov";
import HeaderGov from "@/components/layout/HeaderGov";
import VolunteerHeader from "@/components/pages/VolunteerHeader";
import VolunteerInformation from "@/components/pages/VolunteerInformation";

export default function Page() {
  return (
    <>
      <HeaderGov />

      <main id="conteudo-principal">
        <VolunteerHeader />
        <VolunteerInformation />
      </main>

      <FooterGov />
    </>
  );
}