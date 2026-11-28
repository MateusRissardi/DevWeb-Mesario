import PageHeader from "@/components/cartorio/PageHeader";
import VolunteersTable from "@/components/cartorio/VolunteersTable";

import styles from "./page.module.css";

export default function VoluntariosPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Voluntários"
        description="Consulte as pessoas com interesse em atuar e veja quem já está pré-selecionado ou selecionado."
      />
      <VolunteersTable />
    </div>
  );
}
