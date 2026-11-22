"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAutenticacao } from "@/lib/api/auth";
import {
  ELEITOR_VAZIO,
  salvarSessao,
  useExisteSessao,
} from "@/lib/cidadao/sessao";

type Entrada = "ok" | "/login" | "/cartorio" | "/meus-dados";

function decidir(
  auth: NonNullable<ReturnType<typeof useAutenticacao>> | null,
): Entrada {
  if (auth === null) return "/login";
  if (auth.usuario.papel !== "mesario") return "/cartorio";
  return auth.usuario.mesario_id === null ? "ok" : "/meus-dados";
}

/**
 * O cadastro de voluntário só é para quem tem conta de mesário ainda sem
 * cadastro. A decisão é tomada uma vez, na entrada: concluir o cadastro liga a
 * conta e não pode expulsar a pessoa da tela de sucesso.
 */
export default function GuardaCadastro({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const auth = useAutenticacao();
  const temSessao = useExisteSessao();
  const [entrada, setEntrada] = useState<Entrada | null>(null);

  if (entrada === null && auth !== undefined) {
    setEntrada(decidir(auth));
  }

  useEffect(() => {
    if (entrada === null) return;

    if (entrada !== "ok") {
      router.replace(entrada);
    } else if (temSessao === false) {
      salvarSessao({ eleitor: ELEITOR_VAZIO });
    }
  }, [entrada, temSessao, router]);

  return entrada === "ok" && temSessao ? <>{children}</> : null;
}
