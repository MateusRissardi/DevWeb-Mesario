import { useMemo, useSyncExternalStore } from "react";

import { limparSessao } from "@/lib/cidadao/sessao";

export type Papel = "mesario" | "cartorio" | "administrador";

export interface UsuarioLogado {
  id: number;
  email: string;
  papel: Papel;
  mesario_id: number | null;
}

interface Autenticacao {
  token: string;
  expiraEm: string;
  usuario: UsuarioLogado;
}

// sessionStorage: o token some ao fechar a aba e não fica em disco.
const CHAVE = "mesario:auth";
const EVENTO = "mesario:auth:alterada";

function lerBruto(): string | null {
  try {
    return window.sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function interpretar(bruto: string | null | undefined): Autenticacao | null {
  if (!bruto) return null;
  try {
    const dados = JSON.parse(bruto) as Partial<Autenticacao> | null;
    if (
      !dados ||
      typeof dados.token !== "string" ||
      typeof dados.expiraEm !== "string" ||
      !dados.usuario
    ) {
      return null;
    }
    if (new Date(dados.expiraEm).getTime() <= Date.now()) return null;
    return dados as Autenticacao;
  } catch {
    return null;
  }
}

function gravar(auth: Autenticacao | null) {
  try {
    if (auth) window.sessionStorage.setItem(CHAVE, JSON.stringify(auth));
    else window.sessionStorage.removeItem(CHAVE);
  } catch {
    // Sem sessionStorage o acesso não persiste entre telas.
  }
  window.dispatchEvent(new Event(EVENTO));
}

function assinar(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}

export const obterToken = () => interpretar(lerBruto())?.token ?? null;

export function salvarAutenticacao(
  token: string,
  expiraEm: string,
  usuario: UsuarioLogado,
) {
  gravar({ token, expiraEm, usuario });
}

/** Encerra o acesso neste navegador: token e dados do cidadão. */
export function encerrarAcesso() {
  gravar(null);
  limparSessao();
}

/**
 * `undefined` = ainda hidratando; `null` = sem acesso válido.
 */
export function useAutenticacao(): Autenticacao | null | undefined {
  const bruto = useSyncExternalStore<string | null | undefined>(
    assinar,
    lerBruto,
    () => undefined,
  );
  return useMemo(
    () => (bruto === undefined ? undefined : interpretar(bruto)),
    [bruto],
  );
}
