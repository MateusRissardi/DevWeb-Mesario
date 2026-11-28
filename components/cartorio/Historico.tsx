import { formatarQuando, type Evento } from "@/lib/api/cartorio";

import styles from "./Modais.module.css";

/** Linha do tempo de eventos (mais recente primeiro, como a API devolve). */
export default function Historico({
  eventos,
  vazio = "Nenhum registro ainda.",
}: Readonly<{ eventos: readonly Evento[]; vazio?: string }>) {
  if (eventos.length === 0) return <p>{vazio}</p>;
  return (
    <ul className={styles.historico} aria-label="Histórico">
      {eventos.map((e) => (
        <li key={e.id}>
          <span>{e.texto}</span>
          <time dateTime={e.criado_em}>
            {formatarQuando(e.criado_em)}
            {e.autor ? ` · ${e.autor}` : ""}
          </time>
        </li>
      ))}
    </ul>
  );
}
