"use client";

import {
    BrTable,
    BrTableBody,
    BrTableCell,
    BrTableHeader,
    BrTableHeaderCell,
    BrTableRow,
} from "@govbr-ds/webcomponents-react";

import styles from "./PendingSummary.module.css";

export interface SummaryItem {
    label: string;
    value: number;
}

interface PendingSummaryProps {
    items: readonly SummaryItem[];
}

export default function PendingSummary({ items: summaryItems }: Readonly<PendingSummaryProps>) {
    return (
        <section
            className={styles.root}
            aria-label="Resumo das pendências"
        >
            <div className={styles.scroller}>
                <BrTable
                    className={styles.table}
                    density="medium"
                    dividerStyle="solid"
                    rowDivider
                >
                    <BrTableHeader slot="header">
                        {summaryItems.map((item) => (
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
                            {summaryItems.map((item) => (
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