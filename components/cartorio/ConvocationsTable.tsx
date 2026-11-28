"use client";

import { useState } from "react";

import { BrButton, BrIcon } from "@govbr-ds/webcomponents-react";

import {
  formatarQuando,
  ROTULO_FUNCAO,
  useLista,
  type ConvocacaoLinha,
  type ResumoConvocacoes,
} from "@/lib/api/cartorio";

import { BarraFiltros, ChipsFiltros, EstadoLista, RodapeLista, type DefinicaoFiltro } from "./Controles";
import ConvocationsSummary from "./ConvocationsSummary";
import DataTable, { type DataTableColumn } from "./DataTable";
import DetalheConvocacaoModal from "./DetalheConvocacaoModal";
import { SELO_CONVOCACAO } from "./rotulos";
import StatusBadge from "./StatusBadge";

import styles from "./ConvocationsTable.module.css";

const STATUS = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "convocado", rotulo: "Convocado" },
  { valor: "confirmado", rotulo: "Confirmado" },
  { valor: "recusado", rotulo: "Recusado" },
  { valor: "cancelado", rotulo: "Cancelado" },
] as const;

export default function ConvocationsTable() {
  const lista = useLista<ConvocacaoLinha, ResumoConvocacoes>("/api/cartorio/convocacoes", { status: "" });
  const [aberta, setAberta] = useState<ConvocacaoLinha | null>(null);
  const { dados, erro, carregando, recarregar } = lista;

  const filtros: DefinicaoFiltro[] = [
    { chave: "status", rotulo: "Situação", valor: lista.filtros.status, opcoes: STATUS },
  ];

  const colunas: readonly DataTableColumn<ConvocacaoLinha>[] = [
    { key: "person", label: "Pessoa", columnWidth: "1fr", render: (r) => r.nome },
    {
      key: "location",
      label: "Local / seção",
      columnWidth: "1.2fr",
      render: (r) => (r.local ? `${r.local} · ${r.numero_secao}` : "—"),
    },
    { key: "role", label: "Função", columnWidth: "0.8fr", render: (r) => (r.funcao ? ROTULO_FUNCAO[r.funcao] : "—") },
    {
      key: "channel",
      label: "Canal",
      columnWidth: "0.9fr",
      render: (r) => (r.telefone ? (r.telefone_whatsapp ? "WhatsApp" : "Telefone") : "Sem telefone"),
    },
    {
      key: "status",
      label: "Situação",
      columnWidth: "0.9fr",
      render: (r) => {
        const selo = SELO_CONVOCACAO[r.status];
        return <StatusBadge className={styles.statusBadge} status={selo.tipo} label={selo.rotulo} />;
      },
    },
    { key: "updatedAt", label: "Atualizada em", columnWidth: "0.9fr", render: (r) => formatarQuando(r.atualizada_em) },
    {
      key: "action",
      label: "Ação",
      columnWidth: "128px",
      horizontalAlignment: "center",
      render: (r) => (
        <BrButton
          className={styles.actionButton}
          emphasis="tertiary"
          density="small"
          type="button"
          aria-label={`Abrir convocação de ${r.nome}`}
          onClick={() => setAberta(r)}
        >
          Abrir
          <BrIcon iconName="fa6-solid:arrow-right" source="auto" width="12" height="12" aria-hidden="true" />
        </BrButton>
      ),
    },
  ];

  const resumo = dados?.resumo;

  return (
    <>
      <ConvocationsSummary
        items={[
          { label: "Pendentes", value: resumo?.pendentes ?? 0 },
          { label: "Convocados", value: resumo?.convocados ?? 0 },
          { label: "Confirmados", value: resumo?.confirmados ?? 0 },
          { label: "Recusados ou cancelados", value: (resumo?.recusados ?? 0) + (resumo?.cancelados ?? 0) },
        ]}
      />

      <DataTable
        title="Convocações da unidade"
        columns={colunas}
        rows={dados?.itens ?? []}
        getRowKey={(r) => r.id}
        density="medium"
        overflow="wrap"
        headerActions={
          <BarraFiltros
            placeholder="Buscar por nome, seção ou local..."
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
              textoVazio="Nenhuma convocação ainda. Elas aparecem depois que a seleção é confirmada."
              onTentarDeNovo={recarregar}
            />
            <RodapeLista
              pagina={lista.pagina}
              limite={lista.limite}
              total={dados?.total ?? 0}
              onPagina={lista.setPagina}
              onLimite={lista.setLimite}
              unidade="convocações"
            />
          </>
        }
      />

      {aberta && (
        <DetalheConvocacaoModal
          convocacao={aberta}
          onFechar={() => setAberta(null)}
          onSalvo={() => {
            setAberta(null);
            recarregar();
          }}
        />
      )}
    </>
  );
}
