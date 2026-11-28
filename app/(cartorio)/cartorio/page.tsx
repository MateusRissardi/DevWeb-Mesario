import PageHeader from "@/components/cartorio/PageHeader";
import PainelCartorio from "@/components/cartorio/PainelCartorio";

import styles from "./page.module.css";

export default function CartorioDashboardPage() {
  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="Visão Geral"
        description="Visão geral da situação eleitoral dos mesários"
      />
      <PainelCartorio />
    </div>
  );
}
