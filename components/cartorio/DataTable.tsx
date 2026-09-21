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
type TableOverflow = "truncate" | "wrap";

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
    headerContent?: ReactNode;
    footer?: ReactNode;
    variant?: "plain" | "card";
    density?: Density;
    overflow?: TableOverflow;
}

export default function DataTable<T>({
    title,
    columns,
    rows,
    getRowKey,
    headerActions,
    headerContent,
    footer,
    variant = "plain",
    density = "medium",
    overflow = "truncate",
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

            {headerContent ? (
                <div className={styles.headerContent}>
                    {headerContent}
                </div>
            ) : null}

            <div className={styles.scroller}>
                <BrTable
                    ref={(element) => {
                        if (!element) {
                            return;
                        }

                        Object.assign(element, {
                            dividerStyle: "solid",
                            rowDivider: true,
                            density,
                            overflow,
                            tooltipMode: "enabled",
                        });
                    }}
                    className={styles.table}
                    density={density}
                    dividerStyle="solid"
                    rowDivider
                    overflow={overflow}
                    tooltipMode="enabled"
                >
                    <BrTableHeader slot="header">
                        {columns.map((column) => (
                            <BrTableHeaderCell
                                ref={(element) => {
                                    if (!element) {
                                        return;
                                    }

                                    Object.assign(element, {
                                        columnWidth: column.columnWidth ?? "fill",
                                        horizontalAlignment:
                                            column.horizontalAlignment ?? "start",
                                        overflow,
                                    });
                                }}
                                key={column.key}
                                overflow={overflow}
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