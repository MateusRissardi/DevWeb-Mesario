"use client";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import styles from "./Modais.module.css";

/** Confirmação simples antes de uma ação que não dá para desfazer sozinha. */
export default function ConfirmarModal({
  titulo,
  texto,
  confirmar,
  trabalhando,
  erro,
  onConfirmar,
  onFechar,
}: Readonly<{
  titulo: string;
  texto: string;
  confirmar: string;
  trabalhando?: boolean;
  erro?: string;
  onConfirmar: () => void;
  onFechar: () => void;
}>) {
  return (
    <BrModal
      show
      autoClose
      size="medium"
      titleText={titulo}
      alignFooter="end"
      onBrModalClose={onFechar}
    >
      <div className={styles.content}>
        <p>{texto}</p>
        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
      </div>
      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>
          Cancelar
        </BrButton>
        <BrButton
          emphasis="primary"
          density="small"
          type="button"
          disabled={trabalhando}
          onClick={onConfirmar}
        >
          {trabalhando ? "Aguarde..." : confirmar}
        </BrButton>
      </div>
    </BrModal>
  );
}
