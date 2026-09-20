import PageHeader from "@/components/cartorio/PageHeader";
import PendingSummary from "@/components/cartorio/PendingSummary";
import PendingUnitTable from "@/components/cartorio/PendingUnitTable";

import styles from "./page.module.css";

export default function PendenciasPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Pendências"
        description="Situações que precisam de ação"
      />
      <PendingSummary />
      <PendingUnitTable />
    </div>
  );
}