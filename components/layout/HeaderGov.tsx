import Link from "next/link";

import AccessibilityBar from "./AccessibilityBar";
import styles from "./HeaderGov.module.css";

/*
 * Cabeçalho em HTML simples, e não o <br-header> do gov.br: o web component
 * mantém o logo com `hidden` até terminar a própria hidratação (observers de
 * breakpoint), então o link para a home podia não aparecer em algumas telas.
 */
export default function HeaderGov() {
  return (
    <>
      <AccessibilityBar />

      <header className={styles.header}>
        <Link
          className={styles.logoLink}
          href="/"
          aria-label="Tribunal Superior Eleitoral - Ir para a página inicial"
        >
          <img
            className={styles.logo}
            src="/assets/tse-logo.svg"
            alt=""
            width={105}
            height={44}
          />
        </Link>

        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Pesquisar"
          >
            <img
              className={styles.icon}
              src="/assets/icons/search.svg"
              alt=""
              aria-hidden="true"
            />
          </button>

          <button
            className={styles.iconButton}
            type="button"
            aria-label="Abrir menu principal"
            aria-expanded="false"
          >
            <img
              className={styles.icon}
              src="/assets/icons/menu.svg"
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      </header>
    </>
  );
}
