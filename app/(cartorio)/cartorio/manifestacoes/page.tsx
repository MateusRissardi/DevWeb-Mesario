import ManifestacoesTable from "@/components/cartorio/ManifestationsTable";

import styles from "./page.module.css";

export default function ManifestacoesPage() {
  return (
    <div className={styles.page}>
      <ManifestacoesTable />
    </div>
  );
}
