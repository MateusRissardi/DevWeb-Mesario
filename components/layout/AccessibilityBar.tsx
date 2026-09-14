import styles from "./AccessibilityBar.module.css";

const institutionalLinks = [
  {
    label: "Acessibilidade",
    href: "https://www.tse.jus.br/acessibilidades-tse/",
  },
  {
    label: "Ouvidoria",
    href: "https://www.tse.jus.br/servicos-eleitorais/servicos/ouvidoria-tse",
  },
  {
    label: "Transparência e prestação de contas",
    href: "https://www.tse.jus.br/transparencia-e-prestacao-de-contas",
  },
] as const;

export default function AccessibilityBar() {
  return (
    <nav
      className={styles.bar}
      aria-label="Acessos institucionais"
    >
      <ul className={styles.list}>
        {institutionalLinks.map((link) => (
          <li className={styles.item} key={link.label}>
            <a className={styles.link} href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}