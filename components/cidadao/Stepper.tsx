import styles from "./Stepper.module.css";

const ETAPAS = ["Dados Pessoais", "Confirmação", "Contato", "Aceite"] as const;

interface StepperProps {
  /** Etapa atual, de 1 a 4. */
  atual: 1 | 2 | 3 | 4;
}

export default function Stepper({ atual }: Readonly<StepperProps>) {
  return (
    <nav className={styles.stepper} aria-label="Etapas do cadastro">
      <ol className={styles.list}>
        {ETAPAS.map((rotulo, indice) => {
          const numero = indice + 1;
          const estado =
            numero < atual ? "concluida" : numero === atual ? "atual" : "pendente";

          return (
            <li
              key={rotulo}
              className={`${styles.step} ${styles[estado]}`}
              aria-current={estado === "atual" ? "step" : undefined}
            >
              <span className={styles.marker}>
                {numero}

                {estado === "concluida" && (
                  <span className={styles.check} aria-hidden="true">
                    <i className="fas fa-check" />
                  </span>
                )}
              </span>

              <span className={styles.label}>
                {rotulo}
                {estado === "concluida" && (
                  <span className={styles.srOnly}> (concluída)</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
