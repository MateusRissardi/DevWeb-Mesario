import StatusBadge, {
    StatusBadgeType,
} from "./StatusBadge";

import styles from "./LocationsAttentionCard.module.css";

export interface LocationAttentionRow {
    id: number;
    name: string;
    filled: number;
    total: number;
    vacancies: number;
}

interface LocationsAttentionCardProps {
    rows: readonly LocationAttentionRow[];
}

export default function LocationsAttentionCard({
    rows,
}: Readonly<LocationsAttentionCardProps>) {
    const titleId = "locations-attention-title";

    return (
        <section
            className={styles.card}
            aria-labelledby={titleId}
        >
            <header className={styles.header}>
                <h2 className={styles.title} id={titleId}>
                    Locais que precisam de atenção
                </h2>

                <div className={styles.actions}>
                    <button
                        className={`br-button circle small ${styles.iconButton}`}
                        type="button"
                        aria-label="Pesquisar locais"
                    >
                        <img
                            className={styles.icon}
                            src="/assets/icons/search.svg"
                            alt=""
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        className={`br-button circle small ${styles.iconButton}`}
                        type="button"
                        aria-label="Mais opções"
                    >
                        <img
                            className={styles.icon}
                            src="/assets/icons/footer/more.svg"
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </header>

            <div className={styles.tableViewport}>
                <table className={styles.table}>
                    <colgroup>
                        <col className={styles.localColumn} />
                        <col className={styles.filledColumn} />
                        <col className={styles.vacanciesColumn} />
                        <col className={styles.statusColumn} />
                    </colgroup>

                    <thead>
                        <tr>
                            <th scope="col">Local</th>
                            <th scope="col">Preenchidos</th>
                            <th scope="col">Vagas</th>
                            <th className={styles.sortedHeader} scope="col">
                                Situação
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((location) => (
                            <tr key={location.id}>
                                <td className={styles.locationName}>
                                    {location.name}
                                </td>

                                <td className={styles.centered}>
                                    {location.filled}/{location.total}
                                </td>

                                <td className={styles.centered}>
                                    {location.vacancies}
                                </td>

                                <td className={styles.centered}>
                                    <StatusBadge
                                        status={StatusBadgeType.LocalCritico}
                                        label="Atenção"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className={styles.footer}>
                <button
                    className={`br-button primary small ${styles.viewAllButton}`}
                    type="button"
                >
                    Ver todos os locais
                </button>
            </footer>
        </section>
    );
}