import PageHeader from "@/components/cartorio/PageHeader";
import VolunteersTable from "@/components/cartorio/VolunteersTable";

import { BrButton } from "@govbr-ds/webcomponents-react";

import styles from "./page.module.css";
import VolunteersSummary from "@/components/cartorio/VolunteersSummary";

export default function VoluntariosPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Voluntários"
        description="Consulte as pessoas aptas e disponíveis para composição das mesas receptoras."
      />
      <VolunteersSummary
        ariaLabel="Resumo dos voluntários"
        items={[
          { label: "Todas", value: 1284 },
          { label: "Novas", value: 184 },
          { label: "Em análise", value: 28 },
          { label: "Aptas", value: 986 },
        ]}
      />
      <VolunteersTable />
    </div>
  );
}