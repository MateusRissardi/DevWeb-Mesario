export type MetricComparisonType = "absolute" | "percentage";

export interface MetricCardProps {
	title: string;
	value: number;
	comparisonValue?: number;
	comparisonType?: MetricComparisonType;
	comparisonLabel?: string;
}

const numberFormatter = new Intl.NumberFormat("pt-BR");
const percentageFormatter = new Intl.NumberFormat("pt-BR", {
	maximumFractionDigits: 1,
});

function formatDifference(difference: number, type: MetricComparisonType) {
	const sign = difference > 0 ? "+" : "";

	if (type === "percentage") {
		return `${sign}${percentageFormatter.format(difference)}%`;
	}

	return `${sign}${numberFormatter.format(difference)}`;
}

export default function MetricCard({
	title,
	value,
	comparisonValue,
	comparisonType = "absolute",
	comparisonLabel,
}: MetricCardProps) {
	const hasComparison = comparisonValue !== undefined;
	const difference = hasComparison
		? comparisonType === "percentage"
			? comparisonValue === 0
				? 0
				: ((value - comparisonValue) / comparisonValue) * 100
			: value - comparisonValue
		: undefined;

	return (
		<article className="metric-card">
			<span className="metric-card__title">{title}</span>
			<strong className="metric-card__value">{numberFormatter.format(value)}</strong>
			{difference !== undefined && (
				<span className="metric-card__comparison">
					{formatDifference(difference, comparisonType)}
					{comparisonLabel && ` ${comparisonLabel}`}
				</span>
			)}
			<style>{`
				.metric-card {
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
					min-height: 157px;
					padding: 16px 14px 14px;
					border: 1px solid #c8c8c8;
					border-radius: 6px;
					background: #fff;
				}

				.metric-card__title {
					color: #77766f;
					font-size: 16px;
					line-height: 1.25;
				}

				.metric-card__value {
					margin-top: 17px;
					color: #1359b8;
					font-size: 44px;
					font-weight: 700;
					line-height: 1;
				}

				.metric-card__comparison {
					align-self: flex-start;
					margin-top: 16px;
					padding: 3px 5px;
					color: #fff;
					background: #1359b8;
					font-size: 16px;
					line-height: 1.1;
				}
			`}</style>
		</article>
	);
}
