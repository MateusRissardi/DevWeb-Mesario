import {
  BrHeader,
  BrHeaderLogo,
} from "@govbr-ds/webcomponents-react/ssr";

import AccessibilityBar from "./AccessibilityBar";
import styles from "./HeaderGov.module.css";

export default function HeaderGov() {
  return (
    <>
      <AccessibilityBar />

      <BrHeader
        className={styles.header}
        density="small"
        layoutWidth="full"
      >
        <BrHeaderLogo
          slot="logo"
          src="/assets/tse-logo.svg"
          description="Tribunal Superior Eleitoral"
          href="/"
          width="105px"
          height="44px"
        />

        <div className={styles.actions} slot="functions">
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

        {/* Impede o BrHeader de gerar o botão de menu padrão */}
        <span
          slot="menu-trigger"
          hidden
          aria-hidden="true"
        />
      </BrHeader>
    </>
  );
}