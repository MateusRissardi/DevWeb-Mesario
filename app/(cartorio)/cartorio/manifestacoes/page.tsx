import PageHeader from "@/components/cartorio/PageHeader";
import ManifestacoesTable from "@/components/cartorio/ManifestationsTable";

import { BrButton } from "@govbr-ds/webcomponents-react";

import styles from "./page.module.css";
import ManifestationsSummary from "@/components/cartorio/ManifestationsSummary";

export default function ManifestacoesPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Manifestações"
        description="Acompanhe e analise as pessoas que demonstraram interesse em atuar como mesárias ou mesários voluntários."
        action={<BrButton emphasis="primary" type="button">+ Cadastrar voluntário</BrButton>}
      />
      <ManifestationsSummary
        ariaLabel="Resumo das manifestações"
        items={[
          { label: "Todas", value: 1284 },
          { label: "Novas", value: 184 },
          { label: "Em análise", value: 28 },
          { label: "Aptas", value: 986 },
        ]}
      />
      <ManifestacoesTable />
    </div>
  );
}