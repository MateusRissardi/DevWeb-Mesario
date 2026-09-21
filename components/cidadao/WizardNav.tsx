"use client";

import Link from "next/link";

import { limparSessao } from "@/lib/cidadao/sessao";

import styles from "./WizardNav.module.css";

interface WizardNavProps {
  /** Etapa anterior. Sem ela, o botão de voltar aparece desabilitado. */
  backHref?: string;
  /** Próxima etapa quando não há formulário a enviar. */
  nextHref?: string;
  /** Formulário enviado ao avançar, quando não há `nextHref`. */
  formId?: string;
  nextDisabled?: boolean;
}

export default function WizardNav({
  backHref,
  nextHref,
  formId,
  nextDisabled,
}: Readonly<WizardNavProps>) {
  return (
    <div className={styles.nav}>
      <Link className={styles.cancel} href="/portal" onClick={limparSessao}>
        Cancelar
      </Link>

      <div className={styles.arrows}>
        {backHref ? (
          <Link
            className={`${styles.arrow} ${styles.back}`}
            href={backHref}
            aria-label="Voltar para a etapa anterior"
          >
            <i className="fas fa-chevron-left" aria-hidden="true" />
          </Link>
        ) : (
          <span
            className={`${styles.arrow} ${styles.backDisabled}`}
            aria-hidden="true"
          >
            <i className="fas fa-chevron-left" />
          </span>
        )}

        {nextHref ? (
          <Link
            className={`${styles.arrow} ${styles.next}`}
            href={nextHref}
            aria-label="Avançar para a próxima etapa"
          >
            <i className="fas fa-chevron-right" aria-hidden="true" />
          </Link>
        ) : (
          <button
            className={`${styles.arrow} ${styles.next}`}
            type="submit"
            form={formId}
            disabled={nextDisabled}
            aria-label="Avançar para a próxima etapa"
          >
            <i className="fas fa-chevron-right" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
