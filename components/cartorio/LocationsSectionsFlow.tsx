"use client";

import { useState } from "react";

import {
  BrButton,
  BrIcon,
  BrInput,
  BrModal,
  BrPagination,
} from "@govbr-ds/webcomponents-react";

import DataTable, { type DataTableColumn } from "./DataTable";
import PageHeader from "./PageHeader";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";
import styles from "./LocationsSectionsFlow.module.css";

type View = "locations" | "polling-place" | "section";

interface PollingPlace {
  id: number;
  name: string;
  city: string;
  sections: number;
  complete: number;
  vacancies: number;
  situation: StatusBadgeType;
}

interface SectionRow {
  id: number;
  section: string;
  president: string;
  firstWorker: string;
  secondWorker: string;
  secretary: string;
  vacancies: number;
}

interface CompositionRow {
  id: number;
  role: string;
  person: string;
  situation: StatusBadgeType;
  situationLabel: string;
  action: string;
}

const pollingPlaces: readonly PollingPlace[] = [
  { id: 1, name: "EEB João XXIII", city: "Ibirama", sections: 12, complete: 11, vacancies: 1, situation: StatusBadgeType.LocalAtencao },
  { id: 2, name: "EEB Central", city: "Ibirama", sections: 8, complete: 8, vacancies: 0, situation: StatusBadgeType.LocalCompleto },
  { id: 3, name: "E.M.C.S.", city: "José Boiteux", sections: 6, complete: 4, vacancies: 3, situation: StatusBadgeType.LocalCritico },
];

const sections: readonly SectionRow[] = [
  { id: 181, section: "181", president: "João Silva", firstWorker: "Ana Costa", secondWorker: "Pedro Lima", secretary: "Maria Souza", vacancies: 0 },
  { id: 184, section: "184", president: "Vaga", firstWorker: "Carlos Silva", secondWorker: "Júlia Reis", secretary: "Lucas Costa", vacancies: 1 },
  { id: 183, section: "183", president: "Ana Souza", firstWorker: "Paulo Lima", secondWorker: "Marina Reis", secretary: "Luiz Costa", vacancies: 0 },
];

const composition: readonly CompositionRow[] = [
  { id: 1, role: "Presidente", person: "—", situation: StatusBadgeType.PrioridadeCritica, situationLabel: "Vaga não preenchida", action: "Encontrar voluntário" },
  { id: 2, role: "1º mesário", person: "Carlos Silva", situation: StatusBadgeType.VoluntarioPreSelecionado, situationLabel: "Pré-selecionado", action: "Ver perfil" },
  { id: 3, role: "2º mesário", person: "Júlia Reis", situation: StatusBadgeType.VoluntarioSelecionada, situationLabel: "Selecionada", action: "Ver perfil" },
  { id: 4, role: "Secretário", person: "Lucas Costa", situation: StatusBadgeType.VoluntarioSelecionada, situationLabel: "Selecionada", action: "Ver perfil" },
];

function Summary({ items }: { items: readonly { label: string; value: number }[] }) {
  return (
    <section className={styles.summary} aria-label="Resumo de locais e seções">
      {items.map((item) => (
        <div className={styles.summaryItem} key={item.label}>
          <strong>{item.label}</strong>
          <span>{item.value}</span>
        </div>
      ))}
    </section>
  );
}

function FilterTag({ label }: { label: string }) {
  return (
    <span className={styles.filterTag}>
      {label}
      <BrButton className={styles.removeFilterButton} emphasis="tertiary" shape="circle" type="button" aria-label={`Remover filtro ${label}`}>
        <BrIcon iconName="fa6-solid:xmark" source="auto" width="12" height="12" aria-hidden="true" />
      </BrButton>
    </span>
  );
}

function SearchActions({ placeholder, activeFilters = 1 }: { placeholder: string; activeFilters?: number }) {
  return (
    <>
      <BrInput className={styles.search} type="search" density="small" highlight placeholder={placeholder} ariaLabel={placeholder}>
        <BrButton className={styles.searchButton} slot="action" emphasis="tertiary" shape="circle" type="button" aria-label="Executar busca">
          <BrIcon iconName="fa6-solid:magnifying-glass" source="auto" width="16" height="16" aria-hidden="true" />
        </BrButton>
      </BrInput>
      <BrButton className={styles.filterButton} emphasis="primary" density="small" type="button" aria-label={`Abrir filtros, ${activeFilters} filtros ativos`}>
        Filtros
        <span className={styles.filterCount}>{activeFilters}</span>
      </BrButton>
    </>
  );
}

export default function LocationsSectionsFlow() {
  const [view, setView] = useState<View>("locations");
  const [findVolunteerOpen, setFindVolunteerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const locationColumns: readonly DataTableColumn<PollingPlace>[] = [
    {
      key: "name",
      label: "Local de votação",
      columnWidth: "1fr",
      render: (row) => row.name,
    },
    {
      key: "city",
      label: "Município",
      columnWidth: "0.8fr",
      render: (row) => row.city,
    },
    {
      key: "sections",
      label: "Seções",
      columnWidth: "90px",
      render: (row) => row.sections,
    },
    {
      key: "complete",
      label: "Completas",
      columnWidth: "100px",
      render: (row) => row.complete,
    },
    {
      key: "vacancies",
      label: "Vagas",
      columnWidth: "90px",
      render: (row) => row.vacancies,
    },
    {
      key: "situation",
      label: "Situação",
      columnWidth: "150px",
      render: (row) => (
        <StatusBadge
          className={styles.badge}
          status={row.situation}
        />
      ),
    },
    {
      key: "action",
      label: "Ação",
      columnWidth: "190px",
      horizontalAlignment: "center",
      render: () => (
        <BrButton
          className={styles.rowAction}
          emphasis="tertiary"
          density="small"
          type="button"
          onClick={() => setView("polling-place")}
        >
          Ver seções

          <BrIcon
            iconName="fa6-solid:arrow-right"
            source="auto"
            width="12"
            height="12"
            aria-hidden="true"
          />
        </BrButton>
      ),
    },
  ];

  const sectionColumns: readonly DataTableColumn<SectionRow>[] = [
    { key: "section", label: "Seção", columnWidth: "72px", render: (row) => row.section },
    { key: "president", label: "Presidente", columnWidth: "1.15fr", render: (row) => <span className={row.vacancies ? styles.vacancyText : undefined}>{row.president}</span> },
    { key: "firstWorker", label: "1º mesário", columnWidth: "1.1fr", render: (row) => row.firstWorker },
    { key: "secondWorker", label: "2º mesário", columnWidth: "1.1fr", render: (row) => row.secondWorker },
    { key: "secretary", label: "Secretário", columnWidth: "1.1fr", render: (row) => row.secretary },
    {
      key: "situation", label: "Situação", columnWidth: "104px",
      render: (row) => <StatusBadge className={styles.badge} status={row.vacancies ? StatusBadgeType.LocalAtencao : StatusBadgeType.LocalCompleto} label={row.vacancies ? "1 vaga" : "Completa"} />,
    },
    {
      key: "action", label: "Ação", columnWidth: "72px", horizontalAlignment: "center",
      render: (row) => (
        <BrButton className={styles.iconAction} emphasis="tertiary" shape="circle" type="button" aria-label={`Abrir seção ${row.section}`} onClick={() => setView("section")}>
          <BrIcon iconName="fa6-solid:chevron-right" source="auto" width="12" height="12" aria-hidden="true" />
        </BrButton>
      ),
    },
  ];

  const compositionColumns: readonly DataTableColumn<CompositionRow>[] = [
    {
      key: "role",
      label: "Função",
      columnWidth: "160px",
      render: (row) => row.role,
    },
    {
      key: "person",
      label: "Pessoa",
      columnWidth: "fill",
      render: (row) => row.person,
    },
    {
      key: "situation",
      label: "Situação",
      columnWidth: "190px",
      render: (row) => (
        <StatusBadge
          className={styles.compositionBadge}
          status={row.situation}
          label={row.situationLabel}
        />
      ),
    },
    {
      key: "action",
      label: "Ação",
      columnWidth: "220px",
      horizontalAlignment: "center",
      render: (row) => (
        <BrButton
          className={styles.rowAction}
          emphasis="tertiary"
          density="small"
          type="button"
          onClick={() => row.id === 1 && setFindVolunteerOpen(true)}
        >
          {row.action}

          <BrIcon
            iconName="fa6-solid:arrow-right"
            source="auto"
            width="12"
            height="12"
            aria-hidden="true"
          />
        </BrButton>
      ),
    },
  ];

  if (view === "polling-place") {
    return (
      <div className={styles.page}>
        <PageHeader title="EEB João XXIII" description="Ibirama · 12ª Zona Eleitoral" action={<BrButton emphasis="secondary" density="small" type="button" onClick={() => setView("locations")}>Voltar</BrButton>} />
        <Summary items={[{ label: "Seções", value: 12 }, { label: "Completas", value: 11 }, { label: "Com vagas", value: 1 }, { label: "Vagas abertas", value: 1 }]} />
        <DataTable
          title="Seções do local" columns={sectionColumns} rows={sections} getRowKey={(row) => row.id} density="medium" overflow="truncate"
          headerActions={<SearchActions placeholder="Buscar por seção ou pessoa..." />}
          headerContent={<FilterTag label="Situação: Com vaga" />}
          footer={<BrPagination variant="contextual" current={1} total={1} totalItems={12} perPage={10} ariaLabel="Paginação das seções do local" />}
        />
      </div>
    );
  }

  if (view === "section") {
    return (
      <div className={styles.page}>
        <PageHeader title="Seção 184" description="EEB João XXIII · Ibirama · 12ª Zona Eleitoral" action={<BrButton emphasis="secondary" density="small" type="button" onClick={() => setView("polling-place")}>Voltar</BrButton>} />
        <section className={styles.sectionStatus} aria-label="Situação da seção">
          <strong>Situação da seção</strong>
          <span>1 vaga aberta · Presidente sem responsável</span>
          <StatusBadge className={styles.badge} status={StatusBadgeType.LocalAtencao} />
        </section>
        <DataTable title="Composição da mesa" columns={compositionColumns} rows={composition} getRowKey={(row) => row.id} density="medium" overflow="truncate" />
        <section className={styles.operationalNotes}>
          <h3>Observações operacionais</h3>
          <p>A seção precisa de um presidente para completar a composição.</p>
          <p>Pendência “Seção incompleta” criada automaticamente.</p>
        </section>
        <VolunteerModal open={findVolunteerOpen} onClose={() => setFindVolunteerOpen(false)} onSelect={() => { setFindVolunteerOpen(false); setConfirmOpen(true); }} />
        <ConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); setSuccessOpen(true); }} />
        <SuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Locais e seções" description="Acompanhe a composição das seções eleitorais sob responsabilidade da sua unidade." />
      <Summary items={[{ label: "Locais de votação", value: 24 }, { label: "Seções", value: 184 }, { label: "Seções completas", value: 171 }, { label: "Seções com vagas", value: 13 }]} />
      <DataTable
        title="Locais da unidade" columns={locationColumns} rows={pollingPlaces} getRowKey={(row) => row.id} density="medium" overflow="truncate"
        headerActions={<SearchActions placeholder="Buscar por local ou município..." activeFilters={2} />}
        headerContent={<><FilterTag label="Situação: Com vagas" /><FilterTag label="Município: Ibirama" /></>}
        footer={<BrPagination variant="contextual" current={1} total={3} totalItems={24} perPage={10} ariaLabel="Paginação dos locais da unidade" />}
      />
    </div>
  );
}

function VolunteerModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: () => void }) {
  return (
    <BrModal className={styles.volunteerModal} show={open} size="medium" scrollable autoClose alignFooter="end" onBrModalClose={onClose}>
      <div slot="header" className={styles.modalHeader}>
        <h2>Encontrar voluntário para Presidente</h2>
        <p>Seção 184 · EEB João XXIII</p>
      </div>
      <div className={styles.modalContent}>
        <p>Selecione uma pessoa apta e disponível. Os critérios abaixo apenas ajudam a organizar a busca; a decisão continua sendo do servidor.</p>
        <div className={styles.modalSearchRow}><BrInput className={styles.modalSearch} type="search" density="small" highlight placeholder="Buscar por nome, CPF ou título..." ariaLabel="Buscar voluntário"><BrButton slot="action" emphasis="tertiary" shape="circle" type="button" aria-label="Executar busca"><BrIcon iconName="fa6-solid:magnifying-glass" source="auto" width="16" height="16" aria-hidden="true" /></BrButton></BrInput><BrButton emphasis="primary" density="small" type="button">Filtros</BrButton></div>
        <h3>8 voluntários compatíveis</h3>
        <p>Prioridade operacional: mesmo local de votação e experiência anterior na função.</p>
        <article className={styles.volunteerCard}>
          <div className={styles.volunteerHeading}><strong>Ana Silva</strong><span>Alta compatibilidade</span></div>
          <p>EEB João XXIII · Presidente em 2024 · Disponível</p>
          <div className={styles.tags}><span>Vota neste local</span><span>Experiência como presidente</span></div>
          <BrButton emphasis="primary" density="small" type="button" onClick={onSelect}>Pré-selecionar</BrButton>
        </article>
      </div>
      <div slot="footer"><BrButton emphasis="secondary" density="small" type="button" onClick={onClose}>Fechar</BrButton></div>
    </BrModal>
  );
}

function ConfirmModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <BrModal className={styles.confirmModal} show={open} size="medium" autoClose alignFooter="end" onBrModalClose={onClose}>
      <div slot="header" className={styles.modalHeader}><h2>Confirmar pré-seleção</h2><p>Revise a vaga antes de confirmar.</p></div>
      <div className={styles.modalContent}>
        <section className={styles.selectionSummary}><div><strong>Ana Carolina da Silva</strong><span>Interesse ativo</span></div><b>Presidente · Seção 184</b><p>EEB João XXIII</p><p>Compatibilidade: vota neste local e já atuou como presidente.</p></section>
        <p>Essa ação reserva a voluntária provisoriamente para a vaga. A pré-seleção não representa convocação e nenhuma comunicação será enviada neste momento.</p>
      </div>
      <div slot="footer" className={styles.modalFooter}><BrButton emphasis="secondary" density="small" type="button" onClick={onClose}>Cancelar</BrButton><BrButton emphasis="primary" density="small" type="button" onClick={onConfirm}>Confirmar pré-seleção</BrButton></div>
    </BrModal>
  );
}

function SuccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BrModal className={styles.successModal} show={open} size="medium" autoClose alignFooter="end" onBrModalClose={onClose}>
      <div slot="header" className={styles.modalHeader}><h2>Pré-seleção concluída</h2></div>
      <div className={styles.successContent}><span className={styles.successIcon}><BrIcon iconName="fa6-solid:check" source="auto" width="28" height="28" aria-hidden="true" /></span><h3>Ana Silva foi pré-selecionada</h3><p>Presidente · Seção 184 · EEB João XXIII</p><div className={styles.successInfo}>A vaga foi reservada provisoriamente. Nenhuma convocação ou comunicação foi enviada.</div></div>
      <div slot="footer" className={styles.modalFooter}><BrButton emphasis="secondary" density="small" type="button" onClick={onClose}>Fechar</BrButton><BrButton emphasis="primary" density="small" type="button" onClick={onClose}>Ver pré-seleção</BrButton></div>
    </BrModal>
  );
}
