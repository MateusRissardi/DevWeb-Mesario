"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import { enviar } from "@/lib/api/cartorio";

import styles from "./Modais.module.css";

export default function SecaoFormModal({
  localId,
  onSalvo,
  onFechar,
}: Readonly<{ localId: number; onSalvo: () => void; onFechar: () => void }>) {
  const [numero, setNumero] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro("");
    if (!/^\d+$/.test(numero.trim())) {
      setErro("Informe o número da seção (só números).");
      return;
    }
    setSalvando(true);
    const r = await enviar("POST", `/api/locais-secoes/locais/${localId}/secoes`, {
      numero_secao: Number(numero),
    });
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro.campos.numero_secao ?? r.erro.mensagem);
      return;
    }
    onSalvo();
  }

  return (
    <BrModal
      show
      autoClose
      size="small"
      titleText="Nova seção"
      alignFooter="end"
      onBrModalClose={onFechar}
    >
      <div className={styles.content}>
        <div className={styles.campo}>
          <label htmlFor="secao-numero">Número da seção</label>
          <input
            id="secao-numero"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>
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
        <BrButton emphasis="primary" density="small" type="button" disabled={salvando} onClick={salvar}>
          {salvando ? "Salvando..." : "Criar seção"}
        </BrButton>
      </div>
    </BrModal>
  );
}
