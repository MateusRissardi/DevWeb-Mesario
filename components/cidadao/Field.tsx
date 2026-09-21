import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "./Field.module.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  obrigatorio?: boolean;
  dica?: string;
  erro?: string;
}

export function TextField({
  id,
  label,
  obrigatorio,
  dica,
  erro,
  ...input
}: Readonly<TextFieldProps>) {
  const dicaId = `${id}-dica`;
  const erroId = `${id}-erro`;
  const descricao =
    [dica && dicaId, erro && erroId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {obrigatorio && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>

      <input
        {...input}
        id={id}
        className={`${styles.input} ${erro ? styles.inputInvalid : ""}`}
        aria-required={obrigatorio || undefined}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
      />

      {dica && (
        <p className={styles.hint} id={dicaId}>
          {dica}
        </p>
      )}

      {erro && (
        <p className={styles.error} id={erroId} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

interface CheckboxFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
  id: string;
  children: ReactNode;
}

export function CheckboxField({
  id,
  children,
  ...input
}: Readonly<CheckboxFieldProps>) {
  return (
    <div className={styles.checkbox}>
      <input {...input} id={id} type="checkbox" className={styles.checkboxInput} />
      <label htmlFor={id}>{children}</label>
    </div>
  );
}
