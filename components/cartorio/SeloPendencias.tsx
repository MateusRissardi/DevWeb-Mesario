"use client";

import { useApi, type Pagina, type PendenciaLinha, type ResumoPendencias } from "@/lib/api/cartorio";

import styles from "./SidebarModule.module.css";

/** Quantidade real de pendências, ao lado do item do menu. Some se for zero ou falhar. */
export default function SeloPendencias() {
  const { dados } = useApi<Pagina<PendenciaLinha, ResumoPendencias>>(
    "/api/cartorio/pendencias?limite=1",
  );
  const total = dados?.resumo.todas ?? 0;
  if (total === 0) return null;

  return (
    <span className={styles.badge} aria-label={`${total} pendências`}>
      {total}
    </span>
  );
}
