import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

export interface Eleitor {
  titulo: string;
  nome: string;
  dataNascimento: string;
  nomeMae: string;
  nomePai: string;
  municipio: string;
  zona: string;
  secao: string;
  localVotacao: string;
}

export interface Contato {
  telefone: string;
  whatsapp: boolean;
  email: string;
}

export interface Interesse {
  status: "ativo" | "desistiu";
  /** Data ISO em que o status atual foi definido. */
  desde: string;
}

export const ELEITOR_VAZIO: Eleitor = {
  titulo: "",
  nome: "",
  dataNascimento: "",
  nomeMae: "",
  nomePai: "",
  municipio: "",
  zona: "",
  secao: "",
  localVotacao: "",
};

/** Cada campo aparece quando a etapa correspondente do cadastro é concluída. */
export interface SessaoCidadao {
  eleitor?: Eleitor;
  contato?: Contato;
  interesse?: Interesse;
}

export type SessaoComEleitor = SessaoCidadao & { eleitor: Eleitor };
export type SessaoComContato = SessaoComEleitor & { contato: Contato };
export type SessaoCompleta = SessaoComContato & { interesse: Interesse };

const CHAVE = "mesario:cidadao";
const EVENTO = "mesario:cidadao:alterada";

function lerBruto(): string | null {
  try {
    return window.sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function interpretar(bruto: string | null | undefined): SessaoCidadao | null {
  if (!bruto) {
    return null;
  }

  try {
    const dados: unknown = JSON.parse(bruto);
    return dados && typeof dados === "object" ? (dados as SessaoCidadao) : null;
  } catch {
    return null;
  }
}

function gravar(sessao: SessaoCidadao | null) {
  try {
    if (sessao) {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(sessao));
    } else {
      window.sessionStorage.removeItem(CHAVE);
    }
  } catch {
    // Sem sessionStorage disponível o fluxo não consegue avançar entre etapas.
  }

  window.dispatchEvent(new Event(EVENTO));
}

function assinar(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}

/** Inicia uma nova sessão, descartando qualquer dado anterior. */
export function salvarSessao(sessao: SessaoCidadao) {
  gravar(sessao);
}

export function atualizarSessao(
  alterar: (atual: SessaoCidadao) => SessaoCidadao,
) {
  const atual = interpretar(lerBruto());

  if (atual) {
    gravar(alterar(atual));
  }
}

export function limparSessao() {
  gravar(null);
}

export const temSessao = (s: SessaoCidadao | null): s is SessaoCidadao =>
  s !== null;

export const temEleitor = (s: SessaoCidadao | null): s is SessaoComEleitor =>
  s !== null && s.eleitor !== undefined;

export const temContato = (s: SessaoCidadao | null): s is SessaoComContato =>
  s !== null && s.contato !== undefined;

export const temCadastro = (s: SessaoCidadao | null): s is SessaoCompleta =>
  s !== null && s.contato !== undefined && s.interesse !== undefined;

/**
 * Devolve a sessão do cidadão quando ela atende à `guarda`; caso contrário
 * devolve `null` e redireciona para `destino`. A verificação acontece uma vez,
 * na entrada da tela: limpar a sessão depois (ex.: "Cancelar") não dispara um
 * novo redirecionamento que brigaria com a navegação em andamento.
 */
export function useSessaoExigida<T extends SessaoCidadao>(
  guarda: (sessao: SessaoCidadao | null) => sessao is T,
  destino: string,
): T | null {
  const router = useRouter();

  // `undefined` = ainda no servidor / hidratando; `null` = sem sessão.
  const bruto = useSyncExternalStore<string | null | undefined>(
    assinar,
    lerBruto,
    () => undefined,
  );
  const sessao = useMemo(() => interpretar(bruto), [bruto]);
  const carregando = bruto === undefined;
  const valida = guarda(sessao);
  const verificada = useRef(false);

  useEffect(() => {
    if (carregando || verificada.current) {
      return;
    }

    verificada.current = true;

    if (!valida) {
      router.replace(destino);
    }
  }, [carregando, valida, destino, router]);

  return !carregando && guarda(sessao) ? sessao : null;
}

/** Etapa 2 em diante: o cidadão já passou pela identificação. */
export const useSessaoIniciada = () =>
  useSessaoExigida(temSessao, "/cadastro/dados");

export const useSessaoComContato = () =>
  useSessaoExigida(temContato, "/cadastro/contato");

export const useSessaoCompleta = () => useSessaoExigida(temCadastro, "/login");
