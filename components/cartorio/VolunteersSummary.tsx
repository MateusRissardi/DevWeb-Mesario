"use client";

import {
    BrTable,
    BrTableBody,
    BrTableCell,
    BrTableHeader,
    BrTableHeaderCell,
    BrTableRow,
} from "@govbr-ds/webcomponents-react";

import styles from "./VolunteersSummary.module.css";

const defaultSummaryItems = [
    {
        label: "Todos aptos",
        value: 986,
    },
    {
        label: "Disponíveis",
        value: 674,
    },
    {
        label: "Pré-selecionados",
        value: 118,
    },
    {
        label: "Selecionados",
        value: 194,
    },
] as const;

export interface SummaryItem {
    label: string;
    value: number;
}

interface VolunteersSummaryProps {
    items?: readonly SummaryItem[];
    ariaLabel?: string;
}

export default function VolunteersSummary({
    items = defaultSummaryItems,
    ariaLabel = "Resumo dos voluntários",
}: Readonly<VolunteersSummaryProps>) {
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