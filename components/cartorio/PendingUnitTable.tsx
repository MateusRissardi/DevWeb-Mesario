"use client";

import { useState } from "react";

import { BrButton, BrIcon } from "@govbr-ds/webcomponents-react";

import {
  formatarQuando,
  useLista,
  type PendenciaLinha,
  type ResumoPendencias,
} from "@/lib/api/cartorio";

import { BarraFiltros, ChipsFiltros, EstadoLista, RodapeLista, type DefinicaoFiltro } from "./Controles";
import DataTable, { type DataTableColumn } from "./DataTable";
import DetalheVoluntarioModal from "./DetalheVoluntarioModal";
import PendenciaModal from "./PendenciaModal";
import PendingSummary from "./PendingSummary";
import { ROTULO_TIPO_PENDENCIA, SELO_PRIORIDADE, SELO_STATUS_PENDENCIA } from "./rotulos";
import StatusBadge from "./StatusBadge";

import styles from "./PendingUnitTable.module.css";

const PRIORIDADES = [
  { valor: "critica", rotulo: "Crítica" },
  { valor: "atencao", rotulo: "Atenção" },
  { valor: "informativa", rotulo: "Informativa" },
] as const;

const STATUS = [
  { valor: "aberta", rotulo: "Aberta" },
  { valor: "em_analise", rotulo: "Em análise" },
  { valor: "resolvida", rotulo: "Resolvida" },
] as const;

const TIPOS = Object.entries(ROTULO_TIPO_PENDENCIA).map(([valor, rotulo]) => ({ valor, rotulo }));

export default function PendingUnitTable({ tipoInicial = "" }: Readonly<{ tipoInicial?: string }>) {
  const lista = useLista<PendenciaLinha, ResumoPendencias>("/api/cartorio/pendencias", {
    status: "",
    prioridade: "",
    tipo: tipoInicial,
  });
  const [aberta, setAberta] = useState<number | null>(null);
  const [voluntario, setVoluntario] = useState<number | null>(null);
  const { dados, erro, carregando, recarregar } = lista;

  const filtros: DefinicaoFiltro[] = [
    { chave: "status", rotulo: "Situação", valor: lista.filtros.status, opcoes: STATUS },
    { chave: "prioridade", rotulo: "Prioridade", valor: lista.filtros.prioridade, opcoes: PRIORIDADES },
    { chave: "tipo", rotulo: "Tipo", valor: lista.filtros.tipo, opcoes: TIPOS },
  ];

  const colunas: readonly DataTableColumn<PendenciaLinha>[] = [
    {
      key: "priority",
      label: "Prioridade",
      columnWidth: "0.8fr",
      render: (r) => <StatusBadge className={styles.badge} status={SELO_PRIORIDADE[r.prioridade]} />,
    },
    { key: "pending", label: "Pendência", columnWidth: "1fr", render: (r) => r.titulo },
    { key: "person", label: "Pessoa / Seção", columnWidth: "1.4fr", render: (r) => r.pessoa ?? r.secao ?? "—" },
    { key: "context", label: "Contexto", columnWidth: "1.5fr", render: (r) => r.contexto },
    { key: "owner", label: "Respons.", columnWidth: "0.8fr", render: (r) => r.responsavel ?? "—" },
    { key: "createdAt", label: "Criada em", columnWidth: "0.9fr", render: (r) => formatarQuando(r.criada_em) },
    {
      key: "status",
      label: "Situação",
      columnWidth: "0.8fr",
      render: (r) =>
        r.status === "resolvida" ? "Resolvida" : <StatusBadge status={SELO_STATUS_PENDENCIA[r.status]} />,
    },
    {
      key: "action",
      label: "Ação",
      columnWidth: "80px",
      horizontalAlignment: "center",
      render: (r) => (
        <BrButton
          className={styles.actionButton}
          emphasis="tertiary"
          shape="circle"
          type="button"
          aria-label={`Ver pendência ${r.titulo}${r.pessoa ? ` de ${r.pessoa}` : ""}`}
          onClick={() => setAberta(r.id)}
        >
          <BrIcon iconName="fa6-solid:eye" source="auto" width="16" height="16" aria-hidden="true" />
        </BrButton>
      ),
    },
  ];

  const resumo = dados?.resumo;

  return (
    <>
      <PendingSummary
        items={[
          { label: "Todas", value: resumo?.todas ?? 0 },
          { label: "Críticas", value: resumo?.criticas ?? 0 },
          { label: "Atenção", value: resumo?.atencao ?? 0 },
          { label: "Informativas", value: resumo?.informativas ?? 0 },
        ]}
      />

      <DataTable
        title="Pendências da unidade"
        columns={colunas}
        rows={dados?.itens ?? []}
        getRowKey={(r) => r.id}
        density="medium"
        overflow="truncate"
        headerActions={
          <BarraFiltros
            placeholder="Buscar por pessoa, seção ou contexto..."
            busca={lista.q}
            onBuscar={lista.setQ}
            filtros={filtros}
            onFiltro={lista.setFiltro}
            onLimpar={lista.limpar}
          />
        }
        headerContent={
          <ChipsFiltros filtros={filtros} busca={lista.q} onFiltro={lista.setFiltro} onBuscar={lista.setQ} />
        }
        footer={
          <>
            <EstadoLista
              carregando={carregando}
              erro={erro}
              vazio={dados?.itens.length === 0}
              textoVazio="Nenhuma pendência. Tudo em dia."
              onTentarDeNovo={recarregar}
            />
            <RodapeLista
              pagina={lista.pagina}
              limite={lista.limite}
              total={dados?.total ?? 0}
              onPagina={lista.setPagina}
              onLimite={lista.setLimite}
              unidade="pendências"
            />
          </>
        }
      />

      {aberta !== null && (
        <PendenciaModal
          id={aberta}
          onMudou={recarregar}
          onFechar={() => setAberta(null)}
          onVerVoluntario={(m) => {
            setAberta(null);
            setVoluntario(m);
          }}
        />
      )}
      {voluntario !== null && (
        <DetalheVoluntarioModal id={voluntario} onFechar={() => setVoluntario(null)} />
      )}
    </>
  );
}
