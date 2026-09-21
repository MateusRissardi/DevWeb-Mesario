import styles from "./ConvocationsSummary.module.css";

const summaryItems = [
    {
        label: "Aguardando envio",
        value: 30,
    },
    {
        label: "Enviadas",
        value: 164,
    },
    {
        label: "Ciência confirmada",
        value: 121,
    },
    {
        label: "Falhas",
        value: 7,
    },
] as const;

export default function ConvocationsSummary() {
    return (
        <section className={styles.summary} aria-label="Resumo das convocações">
            {summaryItems.map((item) => (
                <div className={styles.item} key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                </div>
            ))}
        </section>
    );
}