import {
  BrButton,
  BrCard,
} from "@govbr-ds/webcomponents-react/ssr";

import styles from "./AttentionCard.module.css";

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
}

interface AttentionCardProps {
  title: string;
  items: readonly AttentionItem[];
}

export default function AttentionCard({
  title,
  items,
}: Readonly<AttentionCardProps>) {
  return (
    <BrCard className={styles.card}>
      <section className={styles.content} aria-label={title}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.list}>
          {items.map((item) => (
            <article className={styles.item} key={item.id}>
              <h3 className={styles.itemTitle}>{item.title}</h3>

              <p className={styles.description}>
                {item.description}
              </p>

              <BrButton
                className={styles.action}
                type="button"
                emphasis="primary"
                density="small"
                value={item.id}
              >
                {item.actionLabel}
              </BrButton>
            </article>
          ))}
        </div>
      </section>
    </BrCard>
  );
}