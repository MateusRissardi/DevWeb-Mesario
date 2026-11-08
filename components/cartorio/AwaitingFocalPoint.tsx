"use client";

import { BrMessage } from "@govbr-ds/webcomponents-react";

import PageHeader from "./PageHeader";
import styles from "./AwaitingFocalPoint.module.css";

export interface AwaitingFocalPointProps {
  title: string;
}

/** Página de funcionalidade fora do escopo atual, à espera do ponto focal. */
export default function AwaitingFocalPoint({ title }: AwaitingFocalPointProps) {
  return (
    <div className={styles.page}>
      <PageHeader title={title} />
      <BrMessage
        state="info"
        showIcon
        message="Aguardando confirmação do ponto focal"
      />
    </div>
  );
}
