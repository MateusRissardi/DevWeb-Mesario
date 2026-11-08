"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAutenticacao, type Papel } from "@/lib/api/auth";

interface GuardaAcessoProps {
  papeis: readonly Papel[];
  children: ReactNode;
}

/**
 * Esconde a tela de quem não tem acesso e redireciona para o login.
 * É conveniência de navegação: quem protege os dados é a API (401/403).
 */
export default function GuardaAcesso({
  papeis,
  children,
}: Readonly<GuardaAcessoProps>) {
  const router = useRouter();
  const auth = useAutenticacao();
  const permitido = !!auth && papeis.includes(auth.usuario.papel);

  useEffect(() => {
    if (auth !== undefined && !permitido) {
      router.replace("/login");
    }
  }, [auth, permitido, router]);

  return permitido ? <>{children}</> : null;
}
