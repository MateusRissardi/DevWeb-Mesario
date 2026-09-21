"use client";

import { useState } from "react";

import { BrButton } from "@govbr-ds/webcomponents-react";

import ConvocationsSummary from "@/components/cartorio/ConvocationsSummary";
import ConvocationsTable from "@/components/cartorio/ConvocationsTable";
import PageHeader from "@/components/cartorio/PageHeader";
import PrepareConvocations from "@/components/cartorio/PrepareConvocations";
import styles from "./page.module.css";

import ConvocationDetailsModals, {
  type ConvocationDetailsModalMode,
} from "@/components/cartorio/ConvocationDetailsModals";

import ConvocationSendModals, {
  type SendModalMode,
} from "@/components/cartorio/ConvocationSendModals";

type PageMode = "list" | "prepare";

export default function ConvocacoesPage() {
  const [mode, setMode] = useState<PageMode>("list");
  const [modalMode, setModalMode] = useState<SendModalMode>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailsModalMode, setDetailsModalMode] = useState<ConvocationDetailsModalMode>(null);

  if (mode === "prepare") {
    return (
      <>
        <PrepareConvocations
          onBack={() => setMode("list")}
          onConfirm={(ids) => {
            setSelectedIds(ids);
            setModalMode("confirm");
          }}
          onViewDetails={() => setDetailsModalMode("details")}
          onResolveContact={() => setDetailsModalMode("contact-failure")}
        />

        <ConvocationSendModals
          mode={modalMode}
          selectedIds={selectedIds}
          onClose={() => setModalMode(null)}
          onSend={() => setModalMode("success")}
          onViewList={() => {
            setModalMode(null);
            setMode("list");
          }}
        />

        <ConvocationDetailsModals
          mode={detailsModalMode}
          onClose={() => setDetailsModalMode(null)}
          onResend={() => setDetailsModalMode(null)}
        />
      </>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headingRow}>
        <PageHeader
          title="Convocações"
          description="Acompanhe o envio, a entrega e a ciência das convocações dos mesários selecionados."
        />

        <BrButton
          className={styles.prepareButton}
          emphasis="primary"
          density="small"
          type="button"
          onClick={() => setMode("prepare")}
        >
          Preparar envios
        </BrButton>
      </div>

      <ConvocationsSummary />

      <ConvocationsTable
        onViewDetails={() => setDetailsModalMode("details")}
        onResolveContact={() => setDetailsModalMode("contact-failure")}
      />

      <ConvocationDetailsModals
        mode={detailsModalMode}
        onClose={() => setDetailsModalMode(null)}
        onResend={() => setDetailsModalMode(null)}
      />
    </div>
  );
}