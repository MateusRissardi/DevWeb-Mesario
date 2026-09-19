import FooterGov from "@/components/layout/FooterGov";
import HeaderGov from "@/components/layout/HeaderGov";
import VolunteerHeader from "@/components/pages/VolunteerHeader";
import VolunteerInformation from "@/components/pages/VolunteerInformation";
import MetricCard from "@/components/cartorio/MetricCard";

export default function Page() {
  return (
    <>
      <HeaderGov />

      <main id="conteudo-principal">
        <div style={{ display: "flex", flexDirection: "row", gap: "16px", flexWrap: "wrap" }}>
          <MetricCard 
            title = "Usuários"
            value = {1284}
            comparisonValue = {1100}
            comparisonType = "absolute"
            comparisonLabel = "desde o último mês"
          />
          <MetricCard 
            title = "Usuários"
            value = {1284}
            comparisonValue = {1100}
            comparisonType = "absolute"
            comparisonLabel = "desde o último mês"
          />
          <MetricCard 
            title = "Usuários"
            value = {1284}
            comparisonValue = {1100}
            comparisonType = "absolute"
            comparisonLabel = "desde o último mês"
          />
          <MetricCard 
            title = "Usuários"
            value = {1284}
            comparisonValue = {1100}
            comparisonType = "absolute"
            comparisonLabel = "desde o último mês"
          />
        </div>
          {/* <VolunteerHeader />
          <VolunteerInformation /> */}
      </main>

      {/* <FooterGov /> */}
    </>
  );
}