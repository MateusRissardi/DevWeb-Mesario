"use client";

import {
    BrButton,
    BrIcon,
    BrInput,
    BrModal,
} from "@govbr-ds/webcomponents-react";

import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./ConvocationDetailsModals.module.css";

export type ConvocationDetailsModalMode =
    | "details"
    | "contact-failure"
    | null;

interface ConvocationDetailsModalsProps {
    mode: ConvocationDetailsModalMode;
    onClose: () => void;
    onResend: () => void;
}

export default function ConvocationDetailsModals({
    mode,
    onClose,
    onResend,
}: Readonly<ConvocationDetailsModalsProps>) {
    if (mode === "details") {
        return (
            <BrModal
                className={styles.modal}
                show
                autoClose
                size="medium"
                titleText="Detalhes da convocação"
                alignFooter="end"
                onBrModalClose={onClose}
            >
                <div className={styles.content}>
                    <p className={styles.subtitle}>
                        Histórico de comunicação e ciência do mesário.
                    </p>

                    <section className={styles.personCard}>
                        <div className={styles.personHeader}>
                            <div>
                                <strong>Mariana Costa</strong>
                                <span>2º mesário · Seção 193</span>
                            </div>

                            <StatusBadge
                                status={StatusBadgeType.ConvocacaoCienciaConfirmada}
                            />
                        </div>

                        <dl className={styles.detailsList}>
                            <div>
                                <dt>Local</dt>
                                <dd>EEB Central</dd>
                            </div>

                            <div>
                                <dt>Canal principal</dt>
                                <dd>WhatsApp institucional</dd>
                            </div>

                            <div>
                                <dt>Contato</dt>
                                <dd>(48) 99999-1234</dd>
                            </div>
                        </dl>
                    </section>

                    <section className={styles.history}>
                        <h3>
                            <BrIcon
                                iconName="fa6-solid:clock-rotate-left"
                                source="auto"
                                width="16"
                                height="16"
                                aria-hidden="true"
                            />

                            Histórico
                        </h3>

                        <ol className={styles.timeline}>
                            <li>
                                <span className={styles.timelineMarker} aria-hidden="true" />

                                <div>
                                    <strong>Hoje, 17:10</strong>
                                    <p>Ciência confirmada pela mesária.</p>
                                </div>
                            </li>

                            <li>
                                <span className={styles.timelineMarker} aria-hidden="true" />

                                <div>
                                    <strong>Hoje, 16:48</strong>
                                    <p>Convocação entregue pelo WhatsApp.</p>
                                </div>
                            </li>

                            <li>
                                <span className={styles.timelineMarker} aria-hidden="true" />

                                <div>
                                    <strong>Hoje, 16:45</strong>
                                    <p>Convocação encaminhada por Artur.</p>
                                </div>
                            </li>
                        </ol>
                    </section>
                </div>

                <div className={styles.footer} slot="footer">
                    <BrButton
                        emphasis="primary"
                        density="small"
                        type="button"
                        onClick={onClose}
                    >
                        Fechar
                    </BrButton>
                </div>
            </BrModal>
        );
    }

    if (mode === "contact-failure") {
        return (
            <BrModal
                className={styles.modal}
                show
                autoClose
                size="medium"
                titleText="Falha de contato"
                alignFooter="end"
                onBrModalClose={onClose}
            >
                <div className={styles.content}>
                    <section className={styles.personCard}>
                        <div className={styles.personHeader}>
                            <div>
                                <strong>João Costa</strong>
                                <span>1º mesário · Seção 205</span>
                            </div>

                            <StatusBadge status={StatusBadgeType.ConvocacaoFalha} />
                        </div>

                        <dl className={styles.detailsList}>
                            <div>
                                <dt>Local</dt>
                                <dd>E.M.C.S.</dd>
                            </div>

                            <div>
                                <dt>Função</dt>
                                <dd>1º mesário</dd>
                            </div>
                        </dl>
                    </section>

                    <div className={styles.errorMessage} role="alert">
                        <BrIcon
                            iconName="fa6-solid:circle-exclamation"
                            source="auto"
                            width="18"
                            height="18"
                            aria-hidden="true"
                        />

                        <span>
                            <strong>WhatsApp não entregue.</strong>
                            Verifique os dados de contato antes de realizar um novo envio.
                        </span>
                    </div>

                    <section className={styles.contacts}>
                        <h3>Dados de contato</h3>

                        <BrInput
                            label="WhatsApp"
                            type="tel"
                            value="(48) 99999-4321"
                            ariaLabel="WhatsApp de João Costa"
                        >
                            <BrButton
                                slot="action"
                                emphasis="tertiary"
                                shape="circle"
                                type="button"
                                aria-label="Editar WhatsApp"
                            >
                                <BrIcon
                                    iconName="fa6-solid:pencil"
                                    source="auto"
                                    width="14"
                                    height="14"
                                    aria-hidden="true"
                                />
                            </BrButton>
                        </BrInput>

                        <BrInput
                            label="E-mail"
                            type="email"
                            value="joao.costa@email.com"
                            ariaLabel="E-mail de João Costa"
                        >
                            <BrButton
                                slot="action"
                                emphasis="tertiary"
                                shape="circle"
                                type="button"
                                aria-label="Editar e-mail"
                            >
                                <BrIcon
                                    iconName="fa6-solid:pencil"
                                    source="auto"
                                    width="14"
                                    height="14"
                                    aria-hidden="true"
                                />
                            </BrButton>
                        </BrInput>
                    </section>
                </div>

                <div className={styles.footer} slot="footer">
                    <BrButton
                        emphasis="secondary"
                        density="small"
                        type="button"
                        onClick={onClose}
                    >
                        Fechar
                    </BrButton>

                    <BrButton
                        emphasis="primary"
                        density="small"
                        type="button"
                        onClick={onResend}
                    >
                        Reenviar
                    </BrButton>
                </div>
            </BrModal>
        );
    }

    return null;
}