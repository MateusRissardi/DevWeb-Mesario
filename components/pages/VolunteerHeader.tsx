import Link from "next/link";

import styles from "./VolunteerHeader.module.css";

export default function VolunteerHeader() {
  return (
    <section
      className={styles.container}
      aria-labelledby="volunteer-page-title"
    >
      <nav
        className={styles.breadcrumb}
        aria-label="Navegação estrutural"
      >
        <ol className={styles.breadcrumbList}>
          <li>
            <Link
              className={styles.homeLink}
              href="/"
              aria-label="Página inicial"
            >
              <img
                className={styles.homeIcon}
                src="/assets/icons/home.svg"
                alt=""
                aria-hidden="true"
              />
            </Link>
          </li>

          <li className={styles.separator} aria-hidden="true">
            ›
          </li>

          <li className={styles.previousPage} aria-hidden="true">
            ...
          </li>

          <li className={styles.separator} aria-hidden="true">
            ›
          </li>

          <li className={styles.previousPage} aria-hidden="true">
            ...
          </li>

          <li className={styles.separator} aria-hidden="true">
            ›
          </li>

          <li
            className={styles.currentPage}
            aria-current="page"
          >
            Mesário Voluntário
          </li>
        </ol>
      </nav>

      <h1
        className={styles.title}
        id="volunteer-page-title"
      >
        Mesário Voluntário
      </h1>

      <p className={styles.subtitle}>
        Orientações para candidatura
      </p>
    </section>
  );
}