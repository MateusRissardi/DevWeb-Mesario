"use client";

import {
    BrButton,
    BrIcon,
    BrInput,
    BrModal,
} from "@govbr-ds/webcomponents-react";

import StatusBadge, { StatusBadgeType } from "./StatusBadge";
import styles from "./PendingDetailModal.module.css";

export interface PendingDetail {
    title: string;
    metadata: string;
    reason: string;
    president?: string;
    firstPollWorker: string;
    secondPollWorker: string;
    secretary: string;
    history: readonly {
        date: string;
        description: string;
    }[];
}

interface PendingDetailModalProps {
    open: boolean;
    detail: PendingDetail | null;
    onClose: () => void;
}

export default function PendingDetailModal({
    open,
    detail,
    onClose,
}: Readonly<PendingDetailModalProps>) {
    if (!detail) {
        return null;
    }

    return (
        <BrModal
            className={styles.modal}
            show={open}
            size="medium"
            scrollable
            autoClose
            alignFooter="end"
            initialFocusSelector="#pending-detail-close"
            onBrModalClose={onClose}
        >
            <div slot="header" className={styles.header}>
                <h2 className={styles.title}>{detail.title}</h2>
                <p className={styles.metadata}>{detail.metadata}</p>
            </div>

            <div className={styles.content}>
                <p className={styles.reason}>
                    <strong>Motivo da pendência:</strong> {detail.reason}
                </p>

                <section className={styles.members} aria-label="Composição da seção">
                    <div className={styles.presidentRow}>
                        <div className={styles.member}>
                            <strong>Presidente</strong>

                            {detail.president ? (
                                <span>{detail.president}</span>
                            ) : (
                                <StatusBadge
                                    className={styles.missingBadge}
                                    status={StatusBadgeType.PrioridadeCritica}
                                    label="Sem responsável"
                                />
                            )}
                        </div>

                        {!detail.president ? (
                            <BrInput
                                className={styles.search}
                                type="search"
                                density="small"
                                highlight
                                placeholder="Encontrar presidente"
                                ariaLabel="Encontrar presidente para a seção"
                            >
                                <BrButton
                                    className={styles.searchButton}
                                    slot="action"
                                    emphasis="tertiary"
                                    shape="circle"
                                    type="button"
                                    aria-label="Pesquisar presidente"
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
                        ) : null}
                    </div>

                    <div className={styles.member}>
                        <strong>1º mesário</strong>
                        <span>{detail.firstPollWorker}</span>
                    </div>

                    <div className={styles.member}>
                        <strong>2º mesário</strong>
                        <span>{detail.secondPollWorker}</span>
                    </div>

                    <div className={styles.member}>
                        <strong>Secretário</strong>
                        <span>{detail.secretary}</span>
                    </div>
                </section>

                <details className={styles.history} open>
                    <summary className={styles.historySummary}>
                        <span className={styles.historyTitle}>
                            <BrIcon
                                iconName="fa6-solid:clock-rotate-left"
                                source="auto"
                                width="14"
                                height="14"
                                aria-hidden="true"
                            />

                            Histórico
                        </span>

                        <BrIcon
                            className={styles.historyChevron}
                            iconName="fa6-solid:chevron-down"
                            source="auto"
                            width="12"
                            height="12"
                            aria-hidden="true"
                        />
                    </summary>

                    <div className={styles.historyContent}>
                        {detail.history.map((event) => (
                            <div
                                className={styles.historyEvent}
                                key={`${event.date}-${event.description}`}
                            >
                                <strong>{event.date}</strong>
                                <span>{event.description}</span>
                            </div>
                        ))}
                    </div>
                </details>
            </div>

            <div slot="footer" className={styles.footer}>
                <BrButton
                    id="pending-detail-close"
                    className={styles.footerCloseButton}
                    emphasis="secondary"
                    density="small"
                    type="button"
                    onClick={onClose}
                >
                    Fechar
                </BrButton>

                <BrButton
                    className={styles.resolveButton}
                    emphasis="primary"
                    density="small"
                    type="button"
                    disabled={!detail.president}
                >
                    Marcar como resolvido
                </BrButton>
            </div>
        </BrModal>
    );
}