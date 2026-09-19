import MetricCard from "@/components/cartorio/MetricCard";
import PageHeader from "@/components/cartorio/PageHeader";

import styles from "./page.module.css";

const dashboardMetrics = [
  {
    title: "Manifestações",
    value: 1284,
    comparisonText:
      "+ 184 nos últimos 7 dias",
  },
  {
    title: "Voluntários disponíveis",
    value: 986,
    comparisonText:
      "78,6% das manifestações",
  },
  {
    title: "Selecionados",
    value: 312,
    comparisonText:
      "31,6% dos disponíveis",
  },
  {
    title: "Vagas restantes",
    value: 673,
    comparisonText:
      "31,2% ainda não preenchidas",
  },
] as const;

export default function CartorioDashboardPage() {
  return (
    <div className={styles.dashboard}>
      <PageHeader
        title="Visão Geral"
        description="Visão geral da situação eleitoral dos mesários"
      />

      <section
        className={styles.metricsGrid}
        aria-label="Indicadores gerais"
      >
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            comparisonText={
              metric.comparisonText
            }
          />
        ))}
      </section>
    </div>
  );
}