"use client";

import { useState } from "react";

import { BrButton, BrMessage } from "@govbr-ds/webcomponents-react";

import ConvocationsTable from "@/components/cartorio/ConvocationsTable";
import PageHeader from "@/components/cartorio/PageHeader";
import PrepareConvocations from "@/components/cartorio/PrepareConvocations";
import styles from "./page.module.css";

const AVISO =
  "O envio de mensagens está desativado nesta versão. As telas servem apenas para registrar e acompanhar o status das convocações; nenhuma mensagem é enviada aos mesários.";

export default function ConvocacoesPage() {
  const [preparando, setPreparando] = useState(false);
  // Muda ao voltar do preparo, para a lista buscar os dados de novo.
  const [versao, setVersao] = useState(0);

  if (preparando) {
    return (
      <>
        <BrMessage state="warning" showIcon message={AVISO} />
        <PrepareConvocations
          onBack={() => {
            setPreparando(false);
            setVersao((v) => v + 1);
          }}
        />
      </>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headingRow}>
        <PageHeader
          title="Convocações"
          description="Acompanhe a situação das convocações dos mesários pré-selecionados."
        />

        <BrButton
          className={styles.prepareButton}
          emphasis="primary"
          density="small"
          type="button"
          onClick={() => setPreparando(true)}
        >
          Preparar registros
        </BrButton>
      </div>

      <BrMessage state="warning" showIcon message={AVISO} />

      <ConvocationsTable key={versao} />
    </div>
  );
}
