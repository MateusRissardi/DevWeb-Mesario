"use client";

import Link from "next/link";

import { DIAS_PARA_NOVO_CADASTRO } from "@/lib/cidadao/regras";
import { useSessaoCompleta } from "@/lib/cidadao/sessao";

import flow from "./Flow.module.css";
import styles from "./Feedback.module.css";

const ORIENTACAO_ATIVA =
  "Você pode editar suas informações ou retirar seu interesse a qualquer momento.";

const TEXTOS = {
  registro: {
    tom: "sucesso",
    titulo: "Seu interesse foi registrado!",
    resumo: "Seus dados foram registrados.",
    orientacao: ORIENTACAO_ATIVA,
  },
  atualizacao: {
    tom: "sucesso",
    titulo: "Seus dados foram atualizados!",
    resumo: "Seus dados de contato foram atualizados.",
    orientacao: ORIENTACAO_ATIVA,
  },
  retirada: {
    tom: "alerta",
    titulo: "Interesse retirado",
    resumo: "Seu interesse foi retirado",
    orientacao: `Você pode editar suas informações a qualquer momento e marcar seu interesse após ${DIAS_PARA_NOVO_CADASTRO} dias.`,
  },
} as const;

interface FeedbackProps {
  /**
   * `registro` vem do aceite do cadastro, `atualizacao` da edição dos contatos
   * e `retirada` da confirmação de "Retirar interesse".
   */
  variante: keyof typeof TEXTOS;
}

/** Tela de confirmação exibida ao concluir uma ação do cidadão. */
export default function Feedback({ variante }: Readonly<FeedbackProps>) {
  const sessao = useSessaoCompleta();

  if (!sessao) {
    return null;
  }

  const { tom, titulo, resumo, orientacao } = TEXTOS[variante];

  return (
    <section className={styles.container} aria-labelledby="titulo-feedback">
      <span className={`${styles.icon} ${styles[tom]}`} aria-hidden="true">
        <i className={`fas ${tom === "sucesso" ? "fa-check" : "fa-exclamation"}`} />
      </span>

      <h1 className={styles.title} id="titulo-feedback">
        {titulo}
      </h1>

      <div className={styles.messages}>
        <p>{resumo}</p>
        <p>{orientacao}</p>
      </div>

      <Link className={flow.primaryButton} href="/meus-dados">
        Ir para meus dados
      </Link>
    </section>
  );
}
