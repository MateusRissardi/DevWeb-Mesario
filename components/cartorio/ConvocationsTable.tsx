"use client";

import {
    BrButton,
    BrIcon,
    BrInput,
    BrPagination,
} from "@govbr-ds/webcomponents-react";

import DataTable, { type DataTableColumn } from "./DataTable";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./ConvocationsTable.module.css";

interface Convocation {
    id: number;
    person: string;
    location: string;
    role: string;
    channel: string;
    status: StatusBadgeType;
    updatedAt: string;
    actionLabel: string;
}

interface FilterTagProps {
    label: string;
}

interface ConvocationsTableProps {
    onViewDetails: () => void;
    onResolveContact: () => void;
}

const convocations: readonly Convocation[] = [
    {
        id: 1,
        person: "Ana Silva",
        location: "EEB João XXIII · 184",
        role: "Presidente",
        channel: "WhatsApp",
        status: StatusBadgeType.ConvocacaoNaoEnviada,
        updatedAt: "—",
        actionLabel: "Enviar",
    },
    {
        id: 2,
        person: "Mariana Costa",
        location: "EEB Central · 193",
        role: "2º mesário",
        channel: "WhatsApp",
        status: StatusBadgeType.ConvocacaoCienciaConfirmada,
        updatedAt: "Hoje, 17:10",
        actionLabel: "Ver",
    },
    {
        id: 3,
        person: "João Costa",
        location: "E.M.C.S. · 205",
        role: "1º mesário",
        channel: "WhatsApp",
        status: StatusBadgeType.ConvocacaoFalha,
        updatedAt: "Hoje, 16:32",
        actionLabel: "Resolver",
    },
];

function FilterTag({ label }: Readonly<FilterTagProps>) {
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

export default function ConvocationsTable({
    onViewDetails,
    onResolveContact,
}: Readonly<ConvocationsTableProps>) {
    const columns: readonly DataTableColumn<Convocation>[] = [
        {
            key: "person",
            label: "Pessoa",
            columnWidth: "0.6fr",
            render: (item) => item.person,
        },
        {
            key: "location",
            label: "Local / seção",
            columnWidth: "1fr",
            render: (item) => item.location,
        },
        {
            key: "role",
            label: "Função",
            columnWidth: "0.55fr",
            render: (item) => item.role,
        },
        {
            key: "channel",
            label: "Canal",
            columnWidth: "0.55fr",
            render: (item) => item.channel,
        },
        {
            key: "status",
            label: "Situação",
            columnWidth: "152px",
            render: (item) => (
                <StatusBadge
                    className={styles.statusBadge}
                    status={item.status}
                />
            ),
        },
        {
            key: "updatedAt",
            label: "Atualizada em",
            columnWidth: "144px",
            render: (item) => item.updatedAt,
        },
        {
            key: "action",
            label: "Ação",
            columnWidth: "152px",
            horizontalAlignment: "center",
            render: (item) => (
                <BrButton
                    className={styles.actionButton}
                    emphasis="tertiary"
                    density="small"
                    type="button"
                    aria-label={`${item.actionLabel} convocação de ${item.person}`}
                    onClick={() => {
                        if (item.actionLabel === "Ver") {
                            onViewDetails();
                            return;
                        }

                        if (item.actionLabel === "Resolver") {
                            onResolveContact();
                        }
                    }}
                >
                    {item.actionLabel}

                    <BrIcon
                        iconName="fa6-solid:arrow-right"
                        source="auto"
                        width="12"
                        height="12"
                        aria-hidden="true"
                    />
                </BrButton>
            ),
        },
    ];

    return (
        <DataTable
            title="Convocações da unidade"
            columns={columns}
            rows={convocations}
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
                        placeholder="Buscar por nome, seção ou local..."
                        ariaLabel="Buscar convocações"
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
                                width="14"
                                height="14"
                                aria-hidden="true"
                            />
                        </BrButton>
                    </BrInput>

                    <BrButton
                        className={styles.filterButton}
                        emphasis="primary"
                        density="small"
                        type="button"
                    >
                        Filtros
                    </BrButton>
                </>
            }
            headerContent={
                <FilterTag label="Situação: Todas" />
            }
            footer={
                <BrPagination
                    className={styles.pagination}
                    variant="contextual"
                    current={1}
                    total={20}
                    totalItems={194}
                    perPage={10}
                    ariaLabel="Paginação das convocações"
                />
            }
        />
    );
}