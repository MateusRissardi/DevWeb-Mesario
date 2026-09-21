import Link from "next/link";

import styles from "./page.module.css";

export default function PortalPage() {
  return (
    <section className={styles.container} aria-labelledby="portal-title">
      <h1 className={styles.title} id="portal-title">
        Seja um mesário voluntário
      </h1>

      <p className={styles.subtitle}>Sua participação fortalece a democracia.</p>

      <p className={styles.text}>
        O trabalho do mesário é essencial para garantir eleições seguras e
        transparentes.
      </p>

      <ul className={styles.benefits}>
        <li>Serviço voluntário e cidadão</li>
        <li>Conclusão importante para o país</li>
        <li>Exercício da cidadania</li>
      </ul>

      <div className={styles.actions}>
        <Link className={styles.primaryButton} href="/cadastro">
          Quero ser mesário
        </Link>

        <Link className={styles.secondaryButton} href="/login">
          Já sou cadastrado
        </Link>
      </div>
    </section>
  );
}