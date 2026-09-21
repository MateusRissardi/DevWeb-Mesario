import PageHeader from "@/components/cartorio/PageHeader";
import SelecaoTable from "@/components/cartorio/SelectionTable";

import { BrButton } from "@govbr-ds/webcomponents-react";

import styles from "./page.module.css";
import SelectionSummary from "@/components/cartorio/SelectionSummary";

export default function SelecaoPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Seleção"
        description="Revise e consolide as pré-seleções antes de encaminhar os mesários para convocação."
        action={<BrButton emphasis="primary" type="button">Revisar pré-seleções</BrButton>}
      />
      <SelectionSummary
        ariaLabel="Resumo das Seleções"
        items={[
          { label: "Selecionados", value: 194 },
          { label: "Pré-selecionados", value: 118 },
          { label: "Com alertas", value: 6 },
          { label: "Vagas abertas", value: 13 },
        ]}
      />
      <SelecaoTable />
    </div>
  );
}