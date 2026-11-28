"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrButton } from "@govbr-ds/webcomponents-react";

import { formatarQuando, type PainelCartorio } from "@/lib/api/cartorio";

import CadastrarVoluntarioModal from "./CadastrarVoluntarioModal";
import DataTable, { type DataTableColumn } from "./DataTable";
import { EstadoLista } from "./Controles";

import styles from "./RecentManifestationsTable.module.css";

type Recente = PainelCartorio["recentes"][number];

const colunas: readonly DataTableColumn<Recente>[] = [
  { key: "name", label: "Nome", columnWidth: "5fr", render: (r) => r.nome },
  { key: "location", label: "Local de votação", columnWidth: "3fr", render: (r) => r.local_votacao },
  { key: "origin", label: "Origem", columnWidth: "2fr", render: (r) => (r.origem === "presencial" ? "Presencial" : "Portal") },
  { key: "receivedAt", label: "Recebida", columnWidth: "2fr", render: (r) => formatarQuando(r.criado_em) },
];

export default function RecentManifestationsTable({
  rows,
  onMudou,
}: Readonly<{ rows: readonly Recente[]; onMudou: () => void }>) {
  const router = useRouter();
  const [cadastrando, setCadastrando] = useState(false);

  return (
    <>
    <DataTable
      title="Novas manifestações"
      columns={colunas}
      rows={rows}
      getRowKey={(r) => r.id}
      density="medium"
      headerActions={
        <>
          <BrButton className={styles.newButton} emphasis="secondary" density="small" type="button" onClick={() => router.push("/cartorio/manifestacoes")}>
            Ver todas
          </BrButton>
          <BrButton className={styles.newButton} emphasis="primary" density="small" type="button" onClick={() => setCadastrando(true)}>
            + Novo Mesário
          </BrButton>
        </>
      }
      footer={
        <EstadoLista carregando={false} vazio={rows.length === 0} textoVazio="Nenhuma manifestação recebida ainda." />
      }
    />
    {cadastrando && (
      <CadastrarVoluntarioModal onConcluido={onMudou} onFechar={() => setCadastrando(false)} />
    )}
    </>
  );
}
