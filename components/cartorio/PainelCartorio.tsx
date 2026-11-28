"use client";

import { useApi, type PainelCartorio as Painel } from "@/lib/api/cartorio";

import AttentionCard, { type AttentionItem } from "./AttentionCard";
import { EstadoLista } from "./Controles";
import LocationsAttentionCard from "./LocationsAttentionCard";
import MetricCard from "./MetricCard";
import RecentManifestationsTable from "./RecentManifestationsTable";
import VacancyProgressCard from "./VacancyProgressCard";

import styles from "./PainelCartorio.module.css";

const numero = new Intl.NumberFormat("pt-BR");

function percentual(parte: number, todo: number): string {
  if (todo <= 0) return "0%";
  return `${((parte / todo) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`;
}

function itens(p: Painel): AttentionItem[] {
  const a = p.atencao;
  const lista: AttentionItem[] = [];
  if (a.secoes_incompletas > 0) {
    lista.push({
      id: "secoes-incompletas",
      title: plural(a.secoes_incompletas, "seção incompleta", "seções incompletas"),
      description: "Faltam funções para fechar a mesa",
      actionLabel: "Ver pendências",
      href: "/cartorio/pendencias?tipo=secao_incompleta",
    });
  }
  if (a.possiveis_impedimentos > 0) {
    lista.push({
      id: "impedimentos",
      title: plural(a.possiveis_impedimentos, "possível impedimento", "possíveis impedimentos"),
      description: "Registrados pelo cartório, aguardando análise",
      actionLabel: "Ver pendências",
      href: "/cartorio/pendencias?tipo=possivel_impedimento",
    });
  }
  if (a.dados_incompletos > 0) {
    lista.push({
      id: "dados-incompletos",
      title: `${plural(a.dados_incompletos, "cadastro com", "cadastros com")} dados incompletos`,
      description: "Faltam dados de contato para convocar",
      actionLabel: "Ver pendências",
      href: "/cartorio/pendencias?tipo=dados_incompletos",
    });
  }
  if (a.convocacoes_com_problema > 0) {
    lista.push({
      id: "convocacoes",
      title: plural(a.convocacoes_com_problema, "convocação recusada ou cancelada", "convocações recusadas ou canceladas"),
      description: "A vaga pode precisar de outro voluntário",
      actionLabel: "Ver pendências",
      href: "/cartorio/pendencias?tipo=falha_contato",
    });
  }
  if (a.interesse_retirado_com_alocacao > 0) {
    lista.push({
      id: "retirou-interesse",
      title: `${plural(a.interesse_retirado_com_alocacao, "voluntário retirou", "voluntários retiraram")} o interesse`,
      description: "Possuem alocação vinculada",
      actionLabel: "Resolver",
      href: "/cartorio/pendencias?tipo=interesse_retirado",
    });
  }
  return lista;
}

export default function PainelCartorio() {
  const { dados, erro, carregando, recarregar } = useApi<Painel>("/api/cartorio/resumo");
  const p = dados;

  if (!p) {
    return <EstadoLista carregando={carregando} erro={erro} vazio={false} textoVazio="" onTentarDeNovo={recarregar} />;
  }

  return (
    <>
      <section className={styles.metricsGrid} aria-label="Indicadores gerais">
        <MetricCard
          title="Manifestações"
          value={p.manifestacoes.total}
          comparisonText={`+ ${numero.format(p.manifestacoes.ultimos_7_dias)} nos últimos 7 dias`}
        />
        <MetricCard
          title="Voluntários disponíveis"
          value={p.disponiveis}
          comparisonText={`${percentual(p.disponiveis, p.manifestacoes.total)} das manifestações`}
        />
        <MetricCard
          title="Selecionados"
          value={p.selecionados}
          comparisonText={`${percentual(p.selecionados, p.disponiveis)} dos disponíveis`}
        />
        <MetricCard
          title="Vagas restantes"
          value={p.vagas.restantes}
          comparisonText={`${percentual(p.vagas.restantes, p.vagas.total)} ainda não preenchidas`}
        />
      </section>

      <section className={styles.operationalGrid} aria-label="Situação operacional">
        <AttentionCard title="Precisa da sua atenção" items={itens(p)} />
        <div className={styles.operationalColumn}>
          <VacancyProgressCard title="Cobertura das mesas" filled={p.vagas.preenchidas} total={p.vagas.total} />
          <LocationsAttentionCard
            rows={p.locais_com_vagas.map((l) => ({
              id: l.id,
              name: l.nome,
              filled: l.preenchidas,
              total: l.total,
              vacancies: l.vagas,
            }))}
          />
        </div>
      </section>

      <hr className={styles.sectionDivider} />

      <RecentManifestationsTable rows={p.recentes} onMudou={recarregar} />
    </>
  );
}
