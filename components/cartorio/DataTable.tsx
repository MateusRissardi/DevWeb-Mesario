"use client";
import type { ReactNode } from "react";

import {
    BrTable,
    BrTableBody,
    BrTableCell,
    BrTableHeader,
    BrTableHeaderCell,
    BrTableRow,
} from "@govbr-ds/webcomponents-react";

import styles from "./DataTable.module.css";

type ColumnWidth = "content" | "fill" | `${number}fr` | `${number}px`;
type Alignment = "start" | "center" | "end";
type Density = "small" | "medium" | "large";

export interface DataTableColumn<T> {
    key: string;
    label: string;
    header?: ReactNode;
    columnWidth?: ColumnWidth;
    horizontalAlignment?: Alignment;
    render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    title: string;
    columns: readonly DataTableColumn<T>[];
    rows: readonly T[];
    getRowKey: (row: T) => string | number;
    headerActions?: ReactNode;
    footer?: ReactNode;
    variant?: "plain" | "card";
    density?: Density;
}

export default function DataTable<T>({
    title,
    columns,
    rows,
    getRowKey,
    headerActions,
    footer,
    variant = "plain",
    density = "medium",
}: Readonly<DataTableProps<T>>) {
    const rootClassName = [
        styles.root,
        variant === "card" ? styles.card : styles.plain,
    ].join(" ");

    return (
        <section className={rootClassName} aria-label={title}>
            <header className={styles.titleBar}>
                <h2 className={styles.title}>{title}</h2>

                {headerActions ? (
                    <div className={styles.actions}>{headerActions}</div>
                ) : null}
            </header>

            <div className={styles.scroller}>
                <BrTable
                    className={styles.table}
                    density={density}
                    dividerStyle="solid"
                    rowDivider
                    overflow="truncate"
                    tooltipMode="enabled"
                >
                    <BrTableHeader slot="header">
                        {columns.map((column) => (
                            <BrTableHeaderCell
                                key={column.key}
                                className={styles.headerCell}
                                columnWidth={column.columnWidth ?? "fill"}
                                horizontalAlignment={
                                    column.horizontalAlignment ?? "start"
                                }
                            >
                                {column.header ?? column.label}
                            </BrTableHeaderCell>
                        ))}
                    </BrTableHeader>

                    <BrTableBody slot="body">
                        {rows.map((row) => (
                            <BrTableRow key={getRowKey(row)}>
                                {columns.map((column) => (
                                    <BrTableCell
                                        key={column.key}
                                        horizontalAlignment={
                                            column.horizontalAlignment ?? "start"
                                        }
                                    >
                                        {column.render(row)}
                                    </BrTableCell>
                                ))}
                            </BrTableRow>
                        ))}
                    </BrTableBody>
                </BrTable>
            </div>

            {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </section>
    );
}