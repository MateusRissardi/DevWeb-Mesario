import styles from "./ConvocationsSummary.module.css";

export interface ConvocationsSummaryItem {
    label: string;
    value: number;
}

export default function ConvocationsSummary({
    items,
}: Readonly<{ items: readonly ConvocationsSummaryItem[] }>) {
    return (
        <section className={styles.summary} aria-label="Resumo das convocações">
            {items.map((item) => (
                <div className={styles.item} key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                </div>
            ))}
        </section>
    );
}
