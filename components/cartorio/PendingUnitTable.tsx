"use client";

import { useState } from "react";

import {
    BrButton,
    BrIcon,
    BrInput,
    BrPagination,
} from "@govbr-ds/webcomponents-react";

import DataTable, {
    type DataTableColumn,
} from "./DataTable";

import StatusBadge, {
    StatusBadgeType,
} from "./StatusBadge";

import PendingDetailModal, {
    type PendingDetail,
} from "./PendingDetailModal";

import styles from "./PendingUnitTable.module.css";


interface FilterTagProps {
    label: string;
}

function FilterTag({ label }: FilterTagProps) {
    return (
        <span className={styles.filterTag}>
            <span>{label}</span>

            <BrButton
                className={styles.removeFilterButton}
                emphasis="tertiary"
                shape="circle"
                type="button"
                aria-label={`Remover filtro ${label}`}
            >
                <BrIcon
                    iconName="fa6-solid:xmark"
                    source="auto"
                    width="12"
                    height="12"
                    aria-hidden="true"
                />
            </BrButton>
        </span>
    );
}

interface PendingItem {
    id: number;
    priority: StatusBadgeType;
    pending: string;
    personOrSection: string;
    context: string;
    responsible: string;
    createdAt: string;
    situation: StatusBadgeType;
    detail?: PendingDetail;
}

const pendingItems: readonly PendingItem[] = [
    {
        id: 1,
        priority: StatusBadgeType.PrioridadeCritica,
        pending: "Seção incompleta",
        personOrSection: "Seção 184",
        context: "Presidente sem responsável",
        responsible: "Não atribuído",
        createdAt: "Hoje, 09:42",
        situation: StatusBadgeType.PendenciaAberta,
        detail: {
            title: "Seção 184 — EEB João XXIII",
            metadata: "Crítica · Aberta · Criada hoje às 10:42 · Carlos",
            reason: "Seção não possui presidente selecionado",
            firstPollWorker: "Ana Silva",
            secondPollWorker: "Pedro Costa",
            secretary: "Maria Souza",
            history: [
                {
                    date: "Hoje, 11:15",
                    description: "Carlos iniciou análise.",
                },
                {
                    date: "Hoje, 10:42",
                    description: "Pendência criada automaticamente.",
                },
            ],
        },
    },
    {
        id: 2,
        priority: StatusBadgeType.PrioridadeAtencao,
        pending: "Possível impedimento",
        personOrSection: "Ana Silva",
        context: "Pré-selecionada · Seção 204",
        responsible: "Artur",
        createdAt: "Hoje, 08:17",
        situation: StatusBadgeType.PendenciaEmAnalise,
    },
    {
        id: 3,
        priority: StatusBadgeType.PrioridadeAtencao,
        pending: "Falha de contato",
        personOrSection: "João Costa",
        context: "Convocação não entregue",
        responsible: "Não atribuído",
        createdAt: "Ontem",
        situation: StatusBadgeType.PendenciaAberta,
    },
    {
        id: 4,
        priority: StatusBadgeType.PrioridadeInformativa,
        pending: "Interesse retirado",
        personOrSection: "Maria Pereira",
        context: "Seleção vinculada · Seção 311",
        responsible: "Juliana",
        createdAt: "Ontem",
        situation: StatusBadgeType.PendenciaAberta,
    },
];
function createColumns(
    onView: (item: PendingItem) => void,
): readonly DataTableColumn<PendingItem>[] {
    return [
        {
            key: "priority",
            label: "Prioridade",
            columnWidth: "110px",
            render: (item) => (
                <StatusBadge
                    className={styles.badge}
                    status={item.priority}
                />
            ),
        },
        {
            key: "pending",
            label: "Pendência",
            columnWidth: "1.5fr",
            render: (item) => item.pending,
        },
        {
            key: "personOrSection",
            label: "Pessoa/Seção",
            columnWidth: "1.35fr",
            render: (item) => item.personOrSection,
        },
        {
            key: "context",
            label: "Contexto",
            columnWidth: "1.75fr",
            render: (item) => item.context,
        },
        {
            key: "responsible",
            label: "Respon.",
            columnWidth: "1fr",
            render: (item) => item.responsible,
        },
        {
            key: "createdAt",
            label: "Criada em",
            columnWidth: "1fr",
            render: (item) => item.createdAt,
        },
        {
            key: "situation",
            label: "Situação",
            columnWidth: "110px",
            render: (item) => (
                <StatusBadge
                    className={styles.badge}
                    status={item.situation}
                />
            ),
        },
        {
            key: "action",
            label: "Ação",
            columnWidth: "96px",
            horizontalAlignment: "center",
            render: (item) => (
                <div className={styles.actionCell}>
                    <BrButton
                        className={styles.actionButton}
                        emphasis="tertiary"
                        shape="circle"
                        type="button"
                        aria-label={`Visualizar pendência: ${item.pending}`}
                    >
                        <BrIcon
                            iconName="fa6-solid:eye"
                            source="auto"
                            width="16"
                            onClick={() => onView(item)}
                            height="16"
                            aria-hidden="true"
                        />
                    </BrButton>
                </div>
            ),
        },
    ];
}
export default function PendingUnitTable() {
    const [selectedPending, setSelectedPending] =
        useState<PendingDetail | null>(null);

    const columns = createColumns((item) => {
        if (item.detail) {
            setSelectedPending(item.detail);
        }
    });

    return (
        <>
            <DataTable
                title="Pendências da Unidade"
                columns={columns}
                rows={pendingItems}
                getRowKey={(item) => item.id}
                density="medium"
                overflow="wrap"
                headerActions={
                    <>
                        <BrInput
                            className={styles.search}
                            type="search"
                            density="small"
                            highlight
                            placeholder="Buscar por nome, CPF, título, seção, local..."
                            ariaLabel="Buscar pendências"
                        >
                            <BrButton
                                className={styles.searchButton}
                                slot="action"
                                emphasis="tertiary"
                                shape="circle"
                                type="button"
                                aria-label="Executar busca"
                            >
                                <BrIcon
                                    iconName="fa6-solid:magnifying-glass"
                                    source="auto"
                                    width="16"
                                    height="16"
                                    aria-hidden="true"
                                />
                            </BrButton>
                        </BrInput>

                        <BrButton
                            className={styles.filterButton}
                            emphasis="primary"
                            density="small"
                            type="button"
                            aria-label="Abrir filtros, dois filtros ativos"
                        >
                            <span>Filtros</span>
                            <span
                                className={styles.filterCount}
                                aria-hidden="true"
                            >
                                2
                            </span>
                        </BrButton>

                        <BrButton
                            className={styles.moreButton}
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
                headerContent={
                    <>
                        <FilterTag label="Situação: Aberta" />
                        <FilterTag label="Situação: Em análise" />
                    </>
                }
                footer={
                    <BrPagination
                        className={styles.pagination}
                        variant="contextual"
                        current={1}
                        total={1}
                        totalItems={4}
                        perPage={10}
                        ariaLabel="Paginação das pendências da unidade"
                    />
                }
            />

            <PendingDetailModal
                open={selectedPending !== null}
                detail={selectedPending}
                onClose={() => setSelectedPending(null)}
            />
        </>
    );
}