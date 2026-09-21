import type { ReactNode } from "react";

import styles from "./DataList.module.css";

export function DataList({ children }: Readonly<{ children: ReactNode }>) {
  return <dl className={styles.list}>{children}</dl>;
}

interface DataItemProps {
  rotulo: string;
  children: ReactNode;
  /** Ocupa metade da largura, ficando lado a lado com o próximo item. */
  metade?: boolean;
  italico?: boolean;
}

export function DataItem({
  rotulo,
  children,
  metade,
  italico,
}: Readonly<DataItemProps>) {
  return (
    <div className={`${styles.item} ${metade ? styles.half : ""}`}>
      <dt className={styles.term}>{rotulo}</dt>
      <dd className={`${styles.value} ${italico ? styles.italic : ""}`}>
        {children}
      </dd>
    </div>
  );
}
