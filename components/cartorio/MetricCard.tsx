import styles from "./MetricCard.module.css";

export type MetricComparisonType = "absolute" | "percentage";

export interface MetricCardProps {
	title: string;
	value: number;
	comparisonValue?: number;
	comparisonType?: MetricComparisonType;
	comparisonLabel?: string;
	comparisonText?: string;
}

const numberFormatter = new Intl.NumberFormat("pt-BR");
const percentageFormatter = new Intl.NumberFormat(
	"pt-BR",
	{
		maximumFractionDigits: 1,
	},
);

function formatDifference(difference: number, type: MetricComparisonType,
) {
	const sign = difference > 0 ? "+" : "";

	if (type === "percentage") {
		return `${sign}${percentageFormatter.format(difference,)}%`;
	}

	return `${sign}${numberFormatter.format(difference)}`;
}

export default function MetricCard({
	title,
	value,
	comparisonValue,
	comparisonType = "absolute",
	comparisonLabel,
	comparisonText,
}: MetricCardProps) {
	const hasComparison = comparisonValue !== undefined;
	const difference = hasComparison ? comparisonType === "percentage" ? comparisonValue === 0 ? 0 : ((value - comparisonValue) / comparisonValue) * 100 : value - comparisonValue : undefined;
	const calculatedComparison = difference !== undefined ? `${formatDifference(difference, comparisonType,)}${comparisonLabel ? ` ${comparisonLabel}` : ""}` : undefined;

	const displayedComparison = comparisonText ?? calculatedComparison;

	return (
		<article className={styles.card} aria-label={`${title}: ${numberFormatter.format( value,)}`}>
			<span className={styles.title}>
				{title}
			</span>

			<strong className={styles.value}>
				{numberFormatter.format(value)}
			</strong>

			{displayedComparison && (
				<span className={styles.comparison}>
					{displayedComparison}
				</span>
			)}
		</article>
	);
}
