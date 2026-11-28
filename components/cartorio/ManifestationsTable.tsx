"use client";

import { useState } from "react";

import { BrButton, BrIcon } from "@govbr-ds/webcomponents-react";

import {
  formatarQuando,
  useLista,
  type ResumoVoluntarios,
  type VoluntarioLinha,
} from "@/lib/api/cartorio";

import { BarraFiltros, ChipsFiltros, EstadoLista, RodapeLista, type DefinicaoFiltro } from "./Controles";
import DataTable, { type DataTableColumn } from "./DataTable";
import DetalheVoluntarioModal from "./DetalheVoluntarioModal";
import ManifestationsSummary from "./ManifestationsSummary";
import NovoVoluntarioBotao from "./NovoVoluntarioBotao";
import PageHeader from "./PageHeader";
import { SELO_SITUACAO } from "./rotulos";
import StatusBadge from "./StatusBadge";

import styles from "./ManifestationsTable.module.css";

const SITUACOES = [
  { valor: "nova", rotulo: "Nova" },
  { valor: "apta", rotulo: "Apta" },
  { valor: "em_analise", rotulo: "Em análise" },
] as const;

const ORIGENS = [
  { valor: "portal", rotulo: "Portal" },
  { valor: "presencial", rotulo: "Presencial" },
] as const;

const ROTULO_ORIGEM: Record<string, string> = { portal: "Portal", presencial: "Presencial" };

export default function ManifestacoesTable() {
  const lista = useLista<VoluntarioLinha, ResumoVoluntarios>("/api/cartorio/voluntarios", {
    situacao: "",
    origem: "",
  });
  const [aberto, setAberto] = useState<number | null>(null);
  const { dados, erro, carregando, recarregar } = lista;

  const filtros: DefinicaoFiltro[] = [
    { chave: "situacao", rotulo: "Situação", valor: lista.filtros.situacao, opcoes: SITUACOES },
    { chave: "origem", rotulo: "Origem", valor: lista.filtros.origem, opcoes: ORIGENS },
  ];

  const colunas: readonly DataTableColumn<VoluntarioLinha>[] = [
    { key: "person", label: "Pessoa", columnWidth: "1.3fr", render: (r) => r.nome },
    { key: "place", label: "Local de votação", columnWidth: "1.25fr", render: (r) => r.local_votacao },
    { key: "origin", label: "Origem", columnWidth: "0.8fr", render: (r) => ROTULO_ORIGEM[r.origem] },
    { key: "receivedAt", label: "Recebida em", columnWidth: "1fr", render: (r) => formatarQuando(r.criado_em) },
    {
      key: "situation",
      label: "Situação",
      columnWidth: "1fr",
      render: (r) => <StatusBadge className={styles.badge} status={SELO_SITUACAO[r.situacao]} />,
    },
    { key: "contact", label: "Contato", columnWidth: "1fr", render: (r) => r.contato },
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
          aria-label={`Visualizar manifestação de ${r.nome}`}
          onClick={() => setAberto(r.id)}
        >
          <BrIcon iconName="fa6-solid:eye" source="auto" width="16" height="16" aria-hidden="true" />
        </BrButton>
      ),
    },
  ];

  const resumo = dados?.resumo;

  return (
    <>
      <PageHeader
        title="Manifestações"
        description="Acompanhe e analise as pessoas que demonstraram interesse em atuar como mesárias ou mesários voluntários."
        action={<NovoVoluntarioBotao onConcluido={recarregar} />}
      />

      <ManifestationsSummary
        ariaLabel="Resumo das manifestações"
        items={[
          { label: "Todas", value: resumo?.todas ?? 0 },
          { label: "Novas", value: resumo?.novas ?? 0 },
          { label: "Em análise", value: resumo?.em_analise ?? 0 },
          { label: "Aptas", value: resumo?.aptas ?? 0 },
        ]}
      />

      <DataTable
        title="Manifestações da unidade"
        columns={colunas}
        rows={dados?.itens ?? []}
        getRowKey={(r) => r.id}
        density="medium"
        overflow="truncate"
        headerActions={
          <BarraFiltros
            placeholder="Buscar por nome, CPF, título ou seção..."
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
              textoVazio="Nenhuma manifestação encontrada."
              onTentarDeNovo={recarregar}
            />
            <RodapeLista
              pagina={lista.pagina}
              limite={lista.limite}
              total={dados?.total ?? 0}
              onPagina={lista.setPagina}
              onLimite={lista.setLimite}
              unidade="manifestações"
            />
          </>
        }
      />

      {aberto !== null && (
        <DetalheVoluntarioModal id={aberto} onMudou={recarregar} onFechar={() => setAberto(null)} />
      )}
    </>
  );
}
