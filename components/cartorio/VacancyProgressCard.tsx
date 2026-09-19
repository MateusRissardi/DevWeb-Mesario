import { BrCard } from "@govbr-ds/webcomponents-react/ssr";
import styles from "./VacancyProgressCard.module.css";

interface VacancyProgressCardProps {
    title: string;
    filled: number;
    total: number;
}

const numberFormatter = new Intl.NumberFormat("pt-BR");

const percentageFormatter = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

export default function VacancyProgressCard({
    title,
    filled,
    total,
}: Readonly<VacancyProgressCardProps>) {
    const safeTotal = Math.max(total, 0);
    const safeFilled = Math.min(Math.max(filled, 0), safeTotal);

    const percentage =
        safeTotal > 0
            ? (safeFilled / safeTotal) * 100
            : 0;

    const percentageLabel = percentageFormatter.format(percentage);

    return (
        <BrCard className={styles.card}>
            <section className={styles.content} aria-label={title}>
                <h2 className={styles.title}>{title}</h2>

                <p className={styles.percentage}>
                    {percentageLabel}% das vagas preenchidas
                </p>

                <progress
                    className={styles.progress}
                    value={safeFilled}
                    max={safeTotal || 1}
                    aria-label={`${percentageLabel}% das vagas preenchidas`}
                >
                    {percentageLabel}%
                </progress>

                <p className={styles.details}>
                    {numberFormatter.format(safeFilled)} de{" "}
                    {numberFormatter.format(safeTotal)} vagas preenchidas
                </p>
            </section>
        </BrCard>
    );
}