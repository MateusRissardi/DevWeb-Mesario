"use client";

import { useMemo, useState } from "react";

import {
    BrButton,
    BrCheckbox,
    BrIcon,
} from "@govbr-ds/webcomponents-react";

import DataTable, { type DataTableColumn } from "./DataTable";
import PageHeader from "./PageHeader";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./PrepareConvocations.module.css";

interface PrepareConvocationsProps {
    onBack: () => void;
    onConfirm: (selectedIds: number[]) => void;
    onViewDetails: () => void;
    onResolveContact: () => void;
}

interface ConvocationReview {
    id: number;
    person: string;
    location: string;
    role: string;
    channel: string;
    blocked: boolean;
}

const rows: readonly ConvocationReview[] = [
    {
        id: 1,
        person: "Ana Silva",
        location: "EEB João XXIII · 184",
        role: "Presidente",
        channel: "WhatsApp",
        blocked: false,
    },
    {
        id: 2,
        person: "Mariana Costa",
        location: "EEB Central · 193",
        role: "2º mesário",
        channel: "WhatsApp",
        blocked: false,
    },
    {
        id: 3,
        person: "João Costa",
        location: "E.M.C.S. · 205",
        role: "1º mesário",
        channel: "WhatsApp",
        blocked: true,
    },
];

export default function PrepareConvocations({
    onBack,
    onConfirm,
    onViewDetails,
    onResolveContact,
}: Readonly<PrepareConvocationsProps>) {
    const selectableIds = useMemo(
        () => rows.filter((row) => !row.blocked).map((row) => row.id),
        [],
    );

    const [selectedIds, setSelectedIds] = useState<number[]>(selectableIds);

    const allSelected =
        selectableIds.length > 0 &&
        selectableIds.every((id) => selectedIds.includes(id));

    function toggleRow(id: number) {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id],
        );
    }

    function toggleAll() {
        setSelectedIds(allSelected ? [] : selectableIds);
    }

    const columns: readonly DataTableColumn<ConvocationReview>[] = [
        {
            key: "selection",
            label: "Selecionar",
            columnWidth: "64px",
            horizontalAlignment: "center",
            header: (
                <BrCheckbox
                    name="select-all-convocations"
                    checked={allSelected}
                    aria-label="Selecionar todas as convocações disponíveis"
                    onChange={toggleAll}
                />
            ),
            render: (item) => (
                <BrCheckbox
                    name="convocation-selection"
                    value={String(item.id)}
                    checked={selectedIds.includes(item.id)}
                    disabled={item.blocked}
                    aria-label={`Selecionar convocação de ${item.person}`}
                    onChange={() => toggleRow(item.id)}
                />
            ),
        },
        {
            key: "person",
            label: "Pessoa",
            columnWidth: "0.85fr",
            render: (item) => item.person,
        },
        {
            key: "location",
            label: "Local / seção",
            columnWidth: "1.1fr",
            render: (item) => item.location,
        },
        {
            key: "role",
            label: "Função",
            columnWidth: "0.75fr",
            render: (item) => item.role,
        },
        {
            key: "channel",
            label: "Canal",
            columnWidth: "0.65fr",
            render: (item) => item.channel,
        },
        {
            key: "status",
            label: "Situação",
            columnWidth: "152px",
            render: (item) =>
                item.blocked ? (
                    <StatusBadge
                        status={StatusBadgeType.ConvocacaoFalha}
                        label="Contato inválido"
                    />
                ) : (
                    <StatusBadge
                        status={StatusBadgeType.ManifestacaoApta}
                        label="Pronto"
                    />
                ),
        },
        {
            key: "action",
            label: "Ação",
            columnWidth: "128px",
            horizontalAlignment: "center",

            render: (item) => (
                <BrButton
                    className={styles.rowAction}
                    emphasis="tertiary"
                    density="small"
                    type="button"
                    aria-label={
                        item.blocked
                            ? `Resolver contato de ${item.person}`
                            : `Ver convocação de ${item.person}`
                    }
                    onClick={() => {
                        if (item.blocked) {
                            onResolveContact();
                            return;
                        }

                        onViewDetails();
                    }}
                >
                    {item.blocked ? "Resolver" : "Ver"}

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
        <div className={styles.page}>
            <PageHeader
                title="Preparar envios"
                description="Revise as convocações que ainda não foram encaminhadas antes de iniciar o envio."
            />

            <div className={styles.warning} role="status">
                <BrIcon
                    iconName="fa6-solid:triangle-exclamation"
                    source="auto"
                    width="18"
                    height="18"
                    aria-hidden="true"
                />

                <span>
                    <strong>3 convocações estão bloqueadas</strong> e não serão
                    incluídas no envio.
                </span>
            </div>

            <section className={styles.summary} aria-label="Resumo dos envios">
                <div>
                    <strong>Aguardando envio</strong>
                    <span>30</span>
                </div>

                <div>
                    <strong>Enviadas</strong>
                    <span>164</span>
                </div>

                <div>
                    <strong>Selecionadas</strong>
                    <span>{selectedIds.length}</span>
                </div>
            </section>

            <DataTable
                title="Pré-seleções para revisão"
                columns={columns}
                rows={rows}
                getRowKey={(item) => item.id}
                density="medium"
                overflow="wrap"
            />

            <footer className={styles.footer}>
                <p>
                    <strong>{selectedIds.length}</strong>{" "}
                    {selectedIds.length === 1
                        ? "convocação selecionada"
                        : "convocações selecionadas"}{" "}
                    para confirmar
                </p>

                <div className={styles.footerActions}>
                    <BrButton
                        emphasis="secondary"
                        density="small"
                        type="button"
                        onClick={onBack}
                    >
                        Voltar
                    </BrButton>

                    <BrButton
                        emphasis="primary"
                        density="small"
                        type="button"
                        disabled={selectedIds.length === 0}
                        onClick={() => onConfirm(selectedIds)}
                    >
                        Confirmar envio
                    </BrButton>
                </div>
            </footer>
        </div>
    );
}