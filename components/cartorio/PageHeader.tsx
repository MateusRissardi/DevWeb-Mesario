import type { ReactNode } from "react";

import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.heading}>
        <div>
          <h2 className={styles.title}>{title}</h2>

          {description && (
            <p className={styles.description}>
              {description}
            </p>
          )}
        </div>

        {action}
      </div>
    </header>
  );
}