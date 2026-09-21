import type { ReactNode } from "react";

import styles from "./StatusCard.module.css";

interface StatusCardProps {
  titulo: string;
  status: string;
  variante: "sucesso" | "neutro";
  /** Explicação exibida abaixo do selo de status. */
  children: ReactNode;
}

export default function StatusCard({
  titulo,
  status,
  variante,
  children,
}: Readonly<StatusCardProps>) {
  const icone = variante === "sucesso" ? "fa-check-circle" : "fa-times-circle";

  return (
    <div className={styles.card}>
      <p className={styles.title}>{titulo}</p>

      <span className={`${styles.badge} ${styles[variante]}`}>
        <i className={`fas ${icone}`} aria-hidden="true" />
        {status}
      </span>

      <p className={styles.description}>{children}</p>
    </div>
  );
}
