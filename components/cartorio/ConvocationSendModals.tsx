"use client";

import {
  BrButton,
  BrIcon,
  BrModal,
} from "@govbr-ds/webcomponents-react";

import styles from "./ConvocationSendModals.module.css";

export type SendModalMode = "confirm" | "success" | null;

interface ConvocationSendModalsProps {
  mode: SendModalMode;
  selectedIds: readonly number[];
  onClose: () => void;
  onSend: () => void;
  onViewList: () => void;
}

const selectedPeople = [
  {
    id: 1,
    name: "Ana Silva",
    description: "Presidente · EEB João XXIII · Seção 184",
  },
  {
    id: 2,
    name: "Mariana Costa",
    description: "2º mesário · EEB Central · Seção 193",
  },
] as const;

export default function ConvocationSendModals({
  mode,
  selectedIds,
  onClose,
  onSend,
  onViewList,
}: Readonly<ConvocationSendModalsProps>) {
  const people = selectedPeople.filter((person) =>
    selectedIds.includes(person.id),
  );

  if (mode === "confirm") {
    return (
      <BrModal
        className={styles.modal}
        show
        autoClose
        size="medium"
        titleText="Confirmar envio de convocações"
        alignFooter="end"
        onBrModalClose={onClose}
      >
        <div className={styles.content}>
          <p className={styles.introduction}>
            Revise as pessoas selecionadas antes de encaminhar as
            convocações.
          </p>

          <ul className={styles.peopleList}>
            {people.map((person) => (
              <li key={person.id} className={styles.person}>
                <span className={styles.personIcon} aria-hidden="true">
                  <BrIcon
                    iconName="fa6-solid:user"
                    source="auto"
                    width="16"
                    height="16"
                  />
                </span>

                <span>
                  <strong>{person.name}</strong>
                  <small>{person.description}</small>
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.information} role="status">
            <BrIcon
              iconName="fa6-solid:circle-info"
              source="auto"
              width="18"
              height="18"
              aria-hidden="true"
            />

            <span>
              As convocações serão encaminhadas pelo canal principal
              cadastrado para cada mesário.
            </span>
          </div>
        </div>

        <div className={styles.footer} slot="footer">
          <BrButton
            emphasis="secondary"
            density="small"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </BrButton>

          <BrButton
            emphasis="primary"
            density="small"
            type="button"
            onClick={onSend}
          >
            Enviar convocações
          </BrButton>
        </div>
      </BrModal>
    );
  }

  if (mode === "success") {
    return (
      <BrModal
        className={styles.modal}
        show
        autoClose
        size="medium"
        titleText="Envio concluído"
        alignFooter="end"
        onBrModalClose={onClose}
      >
        <div className={styles.successContent}>
          <span className={styles.successIcon} aria-hidden="true">
            <BrIcon
              iconName="fa6-solid:check"
              source="auto"
              width="30"
              height="30"
            />
          </span>

          <strong>
            {selectedIds.length}{" "}
            {selectedIds.length === 1
              ? "convocação foi encaminhada"
              : "convocações foram encaminhadas"}
          </strong>

          <p>
            Os mesários receberão as orientações pelo canal principal
            informado no cadastro.
          </p>

          <div className={styles.note}>
            A situação de cada convocação será atualizada conforme a entrega
            e a confirmação de ciência.
          </div>
        </div>

        <div className={styles.footer} slot="footer">
          <BrButton
            emphasis="secondary"
            density="small"
            type="button"
            onClick={onViewList}
          >
            Ver lista
          </BrButton>

          <BrButton
            emphasis="primary"
            density="small"
            type="button"
            onClick={onClose}
          >
            Fechar
          </BrButton>
        </div>
      </BrModal>
    );
  }

  return null;
}