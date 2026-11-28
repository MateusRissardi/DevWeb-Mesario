import PageHeader from "@/components/cartorio/PageHeader";
import PendingUnitTable from "@/components/cartorio/PendingUnitTable";

import styles from "./page.module.css";

export default async function PendenciasPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ tipo?: string }> }>) {
  const { tipo } = await searchParams;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Pendências"
        description="Situações que precisam de ação"
      />
      <PendingUnitTable tipoInicial={tipo ?? ""} />
    </div>
  );
}
