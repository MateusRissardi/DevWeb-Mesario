"use client";

import { useState } from "react";

import { BrButton, BrIcon } from "@govbr-ds/webcomponents-react";

import {
  useLista,
  type ResumoVoluntarios,
  type VoluntarioLinha,
} from "@/lib/api/cartorio";

import { BarraFiltros, ChipsFiltros, EstadoLista, RodapeLista, type DefinicaoFiltro } from "./Controles";
import DataTable, { type DataTableColumn } from "./DataTable";
import DetalheVoluntarioModal from "./DetalheVoluntarioModal";
import EncontrarVagaModal from "./EncontrarVagaModal";
import { SELO_SELECAO } from "./rotulos";
import StatusBadge from "./StatusBadge";
import VolunteersSummary from "./VolunteersSummary";

import styles from "./VolunteersTable.module.css";

const SELECOES = [
  { valor: "disponivel", rotulo: "Disponível" },
  { valor: "pre_selecionado", rotulo: "Pré-selecionado" },
  { valor: "selecionado", rotulo: "Selecionado" },
] as const;

const INTERESSES = [
  { valor: "ativo", rotulo: "Ativo" },
  { valor: "retirado", rotulo: "Retirado" },
] as const;

/** Só entram nesta tela as manifestações que já foram marcadas como aptas. */
const SO_APTAS = { situacao: "apta" };

export default function VolunteersTable() {
  const lista = useLista<VoluntarioLinha, ResumoVoluntarios>(
    "/api/cartorio/voluntarios",
    { selecao: "", interesse: "" },
    10,
    SO_APTAS,
  );
  const [aberto, setAberto] = useState<number | null>(null);
  const [vaga, setVaga] = useState<number | null>(null);
  const { dados, erro, carregando, recarregar } = lista;

  const filtros: DefinicaoFiltro[] = [
    { chave: "selecao", rotulo: "Situação", valor: lista.filtros.selecao, opcoes: SELECOES },
    { chave: "interesse", rotulo: "Interesse", valor: lista.filtros.interesse, opcoes: INTERESSES },
  ];

  const colunas: readonly DataTableColumn<VoluntarioLinha>[] = [
    { key: "person", label: "Pessoa", columnWidth: "1.3fr", render: (r) => r.nome },
    { key: "place", label: "Local de votação", columnWidth: "1.25fr", render: (r) => r.local_votacao },
    { key: "interest", label: "Interesse", columnWidth: "0.8fr", render: (r) => (r.interesse_ativo ? "Ativo" : "Retirado") },
    {
      key: "selection",
      label: "Situação",
      columnWidth: "1fr",
      render: (r) => {
        const selo = SELO_SELECAO[r.selecao];
        return <StatusBadge className={styles.badge} status={selo.tipo} label={selo.rotulo} />;
      },
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
          aria-label={`Visualizar voluntário ${r.nome}`}
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
      <VolunteersSummary
        ariaLabel="Resumo dos voluntários"
        items={[
          { label: "Todos aptos", value: resumo?.aptas ?? 0 },
          { label: "Disponíveis", value: resumo?.disponiveis ?? 0 },
          { label: "Pré-selecionados", value: resumo?.pre_selecionados ?? 0 },
          { label: "Selecionados", value: resumo?.selecionados ?? 0 },
        ]}
      />

      <DataTable
        title="Voluntários da unidade"
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
              textoVazio="Nenhum voluntário apto encontrado."
              onTentarDeNovo={recarregar}
            />
            <RodapeLista
              pagina={lista.pagina}
              limite={lista.limite}
              total={dados?.total ?? 0}
              onPagina={lista.setPagina}
              onLimite={lista.setLimite}
              unidade="voluntários"
            />
          </>
        }
      />

      {aberto !== null && (
        <DetalheVoluntarioModal
          id={aberto}
          onMudou={recarregar}
          onFechar={() => setAberto(null)}
          onEncontrarVaga={(id) => {
            setAberto(null);
            setVaga(id);
          }}
        />
      )}
      {vaga !== null && (
        <EncontrarVagaModal voluntarioId={vaga} onAlocado={recarregar} onFechar={() => setVaga(null)} />
      )}
    </>
  );
}
