import styles from "./CitizenFooter.module.css";

/**
 * Rodapé enxuto usado nas telas do fluxo do cidadão (portal, cadastro,
 * login etc.) — diferente do FooterGov institucional completo usado na
 * página informativa "/".
 */
export default function CitizenFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        © Justiça Eleitoral - Todos os direitos reservados.
      </p>
    </footer>
  );
}
