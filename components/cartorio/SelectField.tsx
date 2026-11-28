import styles from "./Modais.module.css";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

/** Campo de seleção com rótulo e mensagem de erro, no padrão dos modais do cartório. */
export default function SelectField({
  id,
  rotulo,
  valor,
  opcoes,
  onChange,
  erro,
  desabilitado,
  placeholder = "Selecione",
  ajuda,
}: Readonly<{
  id: string;
  rotulo: string;
  valor: string;
  opcoes: readonly OpcaoSelect[];
  onChange: (valor: string) => void;
  erro?: string;
  desabilitado?: boolean;
  placeholder?: string;
  ajuda?: string;
}>) {
  return (
    <div className={styles.campo}>
      <label htmlFor={id}>{rotulo}</label>
      <select
        id={id}
        value={valor}
        disabled={desabilitado}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {ajuda && !erro && <span>{ajuda}</span>}
      {erro && (
        <span className={styles.campoErro} role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}
