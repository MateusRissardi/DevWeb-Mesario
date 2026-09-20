"use client";

import {
    BrTable,
    BrTableBody,
    BrTableCell,
    BrTableHeader,
    BrTableHeaderCell,
    BrTableRow,
} from "@govbr-ds/webcomponents-react";

import styles from "./ManifestationsSummary.module.css";

const defaultSummaryItems = [
    {
        label: "Todas",
        value: 35,
    },
    {
        label: "Críticas",
        value: 4,
    },
    {
        label: "Atenção",
        value: 23,
    },
    {
        label: "Informativas",
        value: 8,
    },
] as const;

export interface SummaryItem {
    label: string;
    value: number;
}

interface PendingSummaryProps {
    items?: readonly SummaryItem[];
    ariaLabel?: string;
}

export default function PendingSummary({
    items = defaultSummaryItems,
    ariaLabel = "Resumo das pendências",
}: Readonly<PendingSummaryProps>) {
    return (
        <section
            className={styles.root}
            aria-label={ariaLabel}
        >
            <div className={styles.scroller}>
                <BrTable
                    className={styles.table}
                    density="medium"
                    dividerStyle="solid"
                    rowDivider
                >
                    <BrTableHeader slot="header">
                        {items.map((item) => (
                            <BrTableHeaderCell
                                key={item.label}
                                className={styles.headerCell}
                                columnWidth="1fr"
                                horizontalAlignment="start"
                            >
                                {item.label}
                            </BrTableHeaderCell>
                        ))}
                    </BrTableHeader>

                    <BrTableBody slot="body">
                        <BrTableRow>
                            {items.map((item) => (
                                <BrTableCell
                                    key={item.label}
                                    horizontalAlignment="start"
                                >
                                    <span className={styles.value}>
                                        {item.value}
                                    </span>
                                </BrTableCell>
                            ))}
                        </BrTableRow>
                    </BrTableBody>
                </BrTable>
            </div>
        </section>
    );
}