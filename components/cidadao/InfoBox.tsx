"use client";

import { useState, type ReactNode } from "react";

import styles from "./InfoBox.module.css";

interface InfoBoxProps {
  titulo?: string;
  children: ReactNode;
}

/** Aviso informativo azul, que o cidadão pode dispensar. */
export default function InfoBox({ titulo, children }: Readonly<InfoBoxProps>) {
  const [aberto, setAberto] = useState(true);

  if (!aberto) {
    return null;
  }

  return (
    <div className={styles.box} role="note">
      <i className={`fas fa-info-circle ${styles.icon}`} aria-hidden="true" />

      <div className={styles.body}>
        {titulo && <p className={styles.title}>{titulo}</p>}
        {children}
      </div>

      <button
        className={styles.close}
        type="button"
        aria-label="Fechar aviso"
        onClick={() => setAberto(false)}
      >
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    </div>
  );
}
