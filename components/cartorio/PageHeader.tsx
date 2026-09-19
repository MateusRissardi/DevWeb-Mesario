import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <h2 className={styles.title}>{title}</h2>

      {description && (
        <p className={styles.description}>
          {description}
        </p>
      )}
    </header>
  );
}