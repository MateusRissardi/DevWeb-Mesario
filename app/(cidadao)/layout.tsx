import type { ReactNode } from "react";

import HeaderGov from "@/components/layout/HeaderGov";
import BarraSessao from "@/components/cidadao/BarraSessao";
import CitizenFooter from "@/components/cidadao/CitizenFooter";

import styles from "./layout.module.css";

export default function CidadaoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <HeaderGov />
      <BarraSessao />

      <main id="conteudo-principal" className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>

      <CitizenFooter />
    </>
  );
}