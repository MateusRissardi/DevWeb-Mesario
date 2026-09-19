
import AttentionCard, {
  type AttentionItem,
} from "@/components/cartorio/AttentionCard";

import LocationsAttentionCard, {
  type LocationAttentionRow,
} from "@/components/cartorio/LocationsAttentionCard";

import MetricCard from "@/components/cartorio/MetricCard";

import PageHeader from "@/components/cartorio/PageHeader";

import StatusBadge, {
  StatusBadgeType,
} from "@/components/cartorio/StatusBadge";

import VacancyProgressCard from "@/components/cartorio/VacancyProgressCard";

import RecentManifestationsTable from "@/components/cartorio/RecentManifestationsTable";

import styles from "./page.module.css";

const dashboardMetrics = [
  {
    title: "Manifestações",
    value: 1284,
    comparisonText: "+ 184 nos últimos 7 dias",
  },
  {
    title: "Voluntários disponíveis",
    value: 986,
    comparisonText: "78,6% das manifestações",
  },
  {
    title: "Selecionados",
    value: 312,
    comparisonText: "31,6% dos disponíveis",
  },
  {
    title: "Vagas restantes",
    value: 673,
    comparisonText: "31,2% ainda não preenchidas",
  },
] as const;

const attentionItems: readonly AttentionItem[] = [
  {
    id: "impedimentos",
    title: "8 Possuem possíveis impedimentos",
    description: "Precisam de análise antes da seleção",
    actionLabel: "Analisar",
  },
  {
    id: "falhas-contato",
    title: "17 Falhas de contato",
    description: "Convocações não entregues",
    actionLabel: "Ver casos",
  },
  {
    id: "retirada-interesse",
    title: "6 Voluntários retiraram o interesse",
    description: "Possuem seleção vinculada",
    actionLabel: "Resolver",
  },
];

const attentionLocations: readonly LocationAttentionRow[] = [
  {
    id: 1,
    name: "Escola Municipal Christa Sedlacek",
    filled: 5,
    total: 20,
    vacancies: 15,
  },
];

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
            comparisonText={metric.comparisonText}
          />
        ))}
      </section>

      <section
        className={styles.operationalGrid}
        aria-label="Situação operacional"
      >
        <AttentionCard
          title="Precisa da sua atenção"
          items={attentionItems}
        />

        <div className={styles.operationalColumn}>
          <VacancyProgressCard
            title="Cobertura das mesas"
            filled={1487}
            total={2160}
          />

          <LocationsAttentionCard rows={attentionLocations} />
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      <RecentManifestationsTable />
    </div>
  );
}