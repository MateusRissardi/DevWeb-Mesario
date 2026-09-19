"use client";

import {
    BrButton,
    BrIcon,
    BrPagination,
} from "@govbr-ds/webcomponents-react";

import DataTable, {
    type DataTableColumn,
} from "./DataTable";

import styles from "./RecentManifestationsTable.module.css";

interface Manifestation {
    id: number;
    name: string;
    location: string;
    origin: string;
    receivedAt: string;
}

const manifestations: readonly Manifestation[] = [
    {
        id: 1,
        name: "Jéssica José",
        location: "EEB",
        origin: "e-título",
        receivedAt: "Hoje, 16:49",
    },
    {
        id: 2,
        name: "Ruan Nogueira",
        location: "E.M.C.S.",
        origin: "e-título",
        receivedAt: "Hoje, 16:45",
    },
    {
        id: 3,
        name: "Benedito Bezerra",
        location: "EEB",
        origin: "Portal",
        receivedAt: "Hoje, 16:15",
    },
    {
        id: 4,
        name: "Luciano Morais",
        location: "EEB",
        origin: "Portal",
        receivedAt: "Hoje, 16:12",
    },
    {
        id: 5,
        name: "Ana da Rocha",
        location: "E.M.C.S.",
        origin: "e-título",
        receivedAt: "Hoje, 15:54",
    },
    {
        id: 6,
        name: "Lúcia Braga",
        location: "EEB",
        origin: "e-título",
        receivedAt: "Hoje, 10:34",
    },
    {
        id: 7,
        name: "Guilherme Coelho",
        location: "EEB",
        origin: "Presencial",
        receivedAt: "Hoje, 09:42",
    },
    {
        id: 8,
        name: "Márcia Medeiros",
        location: "EEB",
        origin: "Portal",
        receivedAt: "Ontem",
    },
    {
        id: 9,
        name: "João Costa",
        location: "E.M.C.S.",
        origin: "Presencial",
        receivedAt: "2 dias",
    },
    {
        id: 10,
        name: "Maria Pereira",
        location: "EEB",
        origin: "e-título",
        receivedAt: "3 dias",
    },
];

const columns: readonly DataTableColumn<Manifestation>[] = [
    {
        key: "name",
        label: "Nome",
        columnWidth: "5fr",
        render: (manifestation) => manifestation.name,
    },
    {
        key: "location",
        label: "Local",
        columnWidth: "1.25fr",
        render: (manifestation) => manifestation.location,
    },
    {
        key: "origin",
        label: "Origem",
        columnWidth: "1.5fr",
        render: (manifestation) => manifestation.origin,
    },
    {
        key: "receivedAt",
        label: "Recebida",
        columnWidth: "2fr",
        header: (
            <span className={styles.sortHeader}>
                Recebida

                <BrIcon
                    iconName="fa6-solid:sort"
                    source="auto"
                    width="16"
                    height="16"
                    aria-hidden="true"
                />
            </span>
        ),
        render: (manifestation) => manifestation.receivedAt,
    },
    {
        key: "action",
        label: "Ação",
        columnWidth: "96px",
        horizontalAlignment: "center",
        header: (
            <span className={styles.actionHeader}>
                Ação
            </span>
        ),
        render: (manifestation) => (
            <div className={styles.actionCell}>
                <BrButton
                    className={styles.rowAction}
                    emphasis="tertiary"
                    shape="circle"
                    type="button"
                    aria-label={`Visualizar manifestação de ${manifestation.name}`}
                >
                    <BrIcon
                        className={styles.actionIcon}
                        iconName="fa6-solid:eye"
                        source="auto"
                        width="16"
                        height="16"
                        aria-hidden="true"
                    />
                </BrButton>
            </div>
        ),
    },
];

export default function RecentManifestationsTable() {
    return (
        <DataTable
            title="Novas manifestações"
            columns={columns}
            rows={manifestations}
            getRowKey={(manifestation) => manifestation.id}
            density="medium"
            headerActions={
                <>
                    <BrButton
                        className={styles.headerIconButton}
                        emphasis="tertiary"
                        density="small"
                        shape="circle"
                        type="button"
                        aria-label="Pesquisar manifestações"
                    >
                        <BrIcon
                            iconName="fa6-solid:magnifying-glass"
                            source="auto"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        />
                    </BrButton>

                    <BrButton
                        className={styles.newButton}
                        emphasis="primary"
                        density="small"
                        type="button"
                    >
                        + Novo Mesário
                    </BrButton>

                    <BrButton
                        className={styles.headerIconButton}
                        emphasis="tertiary"
                        density="small"
                        shape="circle"
                        type="button"
                        aria-label="Mais opções"
                    >
                        <BrIcon
                            iconName="fa6-solid:ellipsis-vertical"
                            source="auto"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        />
                    </BrButton>
                </>
            }
            footer={
                <BrPagination
                    className={styles.pagination}
                    variant="contextual"
                    current={1}
                    total={12}
                    totalItems={120}
                    perPage={10}
                    ariaLabel="Paginação das novas manifestações"
                />
            }
        />
    );
}