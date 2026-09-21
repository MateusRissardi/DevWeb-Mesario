"use client";

import {
    BrButton,
    BrIcon,
    BrInput,
    BrPagination,
} from "@govbr-ds/webcomponents-react";

import DataTable, { type DataTableColumn } from "./DataTable";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./SelectionTable.module.css";

interface Selection {
    id: number;
    person: string;
    pollingPlace: string;
    post: string;
    situation: StatusBadgeType;
    alert: StatusBadgeType;
    alteredAt: string;
}

const Selection: readonly Selection[] = [
    {
        id: 1,
        person: "Ana Silva",
        pollingPlace: "EEB João XXIII - 184",
        post: "Presidente",
        situation: StatusBadgeType.VoluntarioPreSelecionado,
        alert: StatusBadgeType.SemAlerta,
        alteredAt: "Hoje, 16:49",
    },
    {
        id: 2,
        person: "João Costa",
        pollingPlace: "E.M.C.S. - 205",
        post: "1° mesário",
        situation: StatusBadgeType.VoluntarioPreSelecionado,
        alert: StatusBadgeType.ComAlerta,
        alteredAt: "Hoje, 15:07",
    },
    {
        id: 3,
        person: "Maria Pereira",
        pollingPlace: "EEB Central - 193",
        post: "Secretária",
        situation: StatusBadgeType.VoluntarioSelecionada,
        alert: StatusBadgeType.SemAlerta,
        alteredAt: "Ontem, 16:49",
    },
];

function FilterTag({ label }: { label: string }) {
    return (
        <span className={styles.filterTag}>
            {label}
            <BrButton
                className={styles.removeFilterButton}
                emphasis="tertiary"
                shape="circle"
                type="button"
                aria-label={`Remover filtro ${label}`}
            >
                <BrIcon iconName="fa6-solid:xmark" source="auto" width="12" height="12" aria-hidden="true" />
            </BrButton>
        </span>
    );
}

const columns: readonly DataTableColumn<Selection>[] = [
    { key: "person", label: "Pessoa", columnWidth: "1.3fr", render: (row) => row.person },
    { key: "pollingPlace", label: "Local / Seção", columnWidth: "1.25fr", render: (row) => row.pollingPlace },
    { key: "post", label: "Função", columnWidth: "0.9fr", render: (row) => row.post },
    {
        key: "situation",
        label: "Situação",
        columnWidth: "1fr",
        render: (row) => <StatusBadge className={styles.badge} status={row.situation} />,
    },
    {
        key: "alert",
        label: "Alertas",
        columnWidth: "1fr",
        render: (row) => <StatusBadge className={styles.badge} status={row.alert} />,
    },
    { key: "alteredAt", label: "Alterada em", columnWidth: "1fr", render: (row) => row.alteredAt },
    {
        key: "action",
        label: "Ação",
        columnWidth: "128px",
        horizontalAlignment: "center",
        render: (row) => (
            <BrButton
                className={styles.actionButton}
                emphasis="tertiary"
                type="button"
                aria-label={`Visualizar manifestação de ${row.person}`}
            >
                {ActionName(row)}
            </BrButton>
        ),
    },
];

function ActionName(row: Selection){
    if (
    row.situation === StatusBadgeType.VoluntarioPreSelecionado &&
    row.alert === StatusBadgeType.SemAlerta
  ) {
    return "Revisar";
  }

  if (
    row.situation === StatusBadgeType.VoluntarioPreSelecionado &&
    row.alert === StatusBadgeType.ComAlerta
  ) {
    return "Resolver";
  }

  if (
    row.situation === StatusBadgeType.VoluntarioSelecionada &&
    row.alert === StatusBadgeType.SemAlerta
  ) {
    return "Ver";
  }

  return "Ver";
}

export default function SelecaoTable() {
    return (
        <DataTable
            title="Seleções da unidade"
            columns={columns}
            rows={Selection}
            getRowKey={(row) => row.id}
            density="medium"
            overflow="truncate"
            headerActions={
                <>
                    <BrInput className={styles.search} type="search" density="small" highlight placeholder="Buscar por nome, CPF, título ou seção..." ariaLabel="Buscar manifestações">
                        <BrButton className={styles.searchButton} slot="action" emphasis="tertiary" shape="circle" type="button" aria-label="Executar busca">
                            <BrIcon iconName="fa6-solid:magnifying-glass" source="auto" width="16" height="16" aria-hidden="true" />
                        </BrButton>
                    </BrInput>
                    <BrButton className={styles.filterButton} emphasis="primary" density="small" type="button" aria-label="Abrir filtros, três filtros ativos">
                        Filtros <span className={styles.filterCount}>3</span>
                    </BrButton>
                    <BrButton className={styles.moreButton} emphasis="tertiary" density="small" shape="circle" type="button" aria-label="Mais opções">
                        <BrIcon iconName="fa6-solid:ellipsis-vertical" source="auto" width="16" height="16" aria-hidden="true" />
                    </BrButton>
                </>
            }
            headerContent={
                <>
                    <FilterTag label="Município: Ibirama" />
                    <FilterTag label="Situação: Pré-selecionado" />
                </>
            }
            footer={<BrPagination variant="contextual" current={1} total={1} totalItems={3} perPage={10} ariaLabel="Paginação das manifestações da unidade" />}
        />
    );
}