"use client";

import { useRouter } from "next/navigation";

import { encerrarAcesso, useAutenticacao } from "@/lib/api/auth";

import styles from "./BarraSessao.module.css";

/** Mostra quem está logado e o botão Sair nas telas do cidadão. */
export default function BarraSessao() {
  const router = useRouter();
  const auth = useAutenticacao();

  if (!auth) return null;

  function sair() {
    encerrarAcesso();
    router.replace("/login");
  }

  return (
    <div className={styles.barra}>
      <span className={styles.usuario}>{auth.usuario.email}</span>
      <button className={styles.sair} type="button" onClick={sair}>
        Sair
      </button>
    </div>
  );
}
