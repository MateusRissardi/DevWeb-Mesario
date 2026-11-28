import SelecaoTable from "@/components/cartorio/SelectionTable";

import styles from "./page.module.css";

export default function SelecaoPage() {
  return (
    <div className={styles.page}>
      <SelecaoTable />
    </div>
  );
}
