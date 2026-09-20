"use client";

import {
    BrButton,
    BrIcon,
    BrInput,
    BrPagination,
} from "@govbr-ds/webcomponents-react";

import DataTable, { type DataTableColumn } from "./DataTable";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./ManifestationsTable.module.css";

interface Manifestation {
    id: number;
    person: string;
    pollingPlace: string;
    source: string;
    receivedAt: string;
    situation: StatusBadgeType;
    contact: string;
}

const manifestations: readonly Manifestation[] = [
    {
        id: 1,
        person: "Ana Silva",
        pollingPlace: "EEB João XXIII",
        source: "Portal",
        receivedAt: "Hoje, 16:49",
        situation: StatusBadgeType.ManifestacaoNova,
        contact: "Completo",
    },
    {
        id: 2,
        person: "João Costa",
        pollingPlace: "E.M.C.S.",
        source: "Presencial",
        receivedAt: "Hoje, 09:42",
        situation: StatusBadgeType.ManifestacaoApta,
        contact: "Sem e-mail",
    },
    {
        id: 3,
        person: "Maria Pereira",
        pollingPlace: "EEB Central",
        source: "e-Título",
        receivedAt: "Ontem",
        situation: StatusBadgeType.ManifestacaoEmAnalise,
        contact: "Completo",
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

const columns: readonly DataTableColumn<Manifestation>[] = [
    { key: "person", label: "Pessoa", columnWidth: "1.3fr", render: (row) => row.person },
    { key: "pollingPlace", label: "Local de votação", columnWidth: "1.25fr", render: (row) => row.pollingPlace },
    { key: "source", label: "Origem", columnWidth: "0.9fr", render: (row) => row.source },
    { key: "receivedAt", label: "Recebida em", columnWidth: "1fr", render: (row) => row.receivedAt },
    {
        key: "situation",
        label: "Situação",
        columnWidth: "1fr",
        render: (row) => <StatusBadge className={styles.badge} status={row.situation} />,
    },
    { key: "contact", label: "Contato", columnWidth: "1fr", render: (row) => row.contact },
    {
        key: "action",
        label: "Ação",
        columnWidth: "96px",
        horizontalAlignment: "center",
        render: (row) => (
            <BrButton
                className={styles.actionButton}
                emphasis="tertiary"
                shape="circle"
                type="button"
                aria-label={`Visualizar manifestação de ${row.person}`}
            >
                <BrIcon iconName="fa6-solid:eye" source="auto" width="16" height="16" aria-hidden="true" />
            </BrButton>
        ),
    },
];

export default function ManifestacoesTable() {
    return (
        <DataTable
            title="Manifestações da unidade"
            columns={columns}
            rows={manifestations}
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
                    <FilterTag label="Origem: Presencial" />
                    <FilterTag label="Situação: Nova" />
                    <FilterTag label="Local: EEB João XXIII" />
                </>
            }
            footer={<BrPagination variant="contextual" current={1} total={1} totalItems={3} perPage={10} ariaLabel="Paginação das manifestações da unidade" />}
        />
    );
}