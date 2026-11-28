"use client";

import { useCallback, useEffect, useState } from "react";

import type { Pagina } from "@/lib/server/db/cartorio";

import { apiFetch, lerErro, type ErroApi } from "./client";

export type {
  AlocacaoLinha,
  Candidato,
  ConvocacaoLinha,
  LocalLinha,
  PainelCartorio,
  Pagina,
  ResumoAlocacoes,
  ResumoConvocacoes,
  ResumoLocais,
  ResumoSecoes,
  ResumoVoluntarios,
  SecaoDetalhe,
  SecaoLinha,
  VoluntarioLinha,
} from "@/lib/server/db/cartorio";
export type { Evento } from "@/lib/server/db/eventos";
export type {
  PendenciaDetalhe,
  PendenciaLinha,
  ResumoPendencias,
  TipoPendencia,
} from "@/lib/server/db/pendencias";
export type {
  VagaCompativel,
  Validacao,
  VoluntarioDetalhe,
} from "@/lib/server/db/voluntarios";
export type { ResultadoConfirmacao } from "@/lib/server/db/cartorio";

const FALHA_REDE: ErroApi = {
  mensagem: "Não foi possível conectar ao servidor. Tente novamente.",
  campos: {},
};

export type Resposta<T> = { ok: true; dados: T } | { ok: false; erro: ErroApi };

/** Monta o caminho com a query string, ignorando valores vazios. */
export function comParametros(
  caminho: string,
  params: Record<string, string | number | undefined | null>,
): string {
  const consulta = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      consulta.set(chave, String(valor));
    }
  }
  const texto = consulta.toString();
  return texto ? `${caminho}?${texto}` : caminho;
}

/** Chamada de escrita (POST, PUT, DELETE) com o token do usuário. */
export async function enviar<T = unknown>(
  metodo: "POST" | "PUT" | "DELETE",
  caminho: string,
  corpo?: unknown,
): Promise<Resposta<T>> {
  try {
    const resposta = await apiFetch(caminho, {
      method: metodo,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    if (!resposta.ok) {
      return { ok: false, erro: await lerErro(resposta) };
    }
    if (resposta.status === 204) return { ok: true, dados: undefined as T };
    return { ok: true, dados: (await resposta.json()) as T };
  } catch {
    return { ok: false, erro: FALHA_REDE };
  }
}

/** Leitura pontual (GET), para consultas disparadas por um clique. */
export async function buscar<T = unknown>(caminho: string): Promise<Resposta<T>> {
  try {
    const resposta = await apiFetch(caminho);
    if (!resposta.ok) return { ok: false, erro: await lerErro(resposta) };
    return { ok: true, dados: (await resposta.json()) as T };
  } catch {
    return { ok: false, erro: FALHA_REDE };
  }
}

interface Estado<T> {
  chave: string;
  dados?: T;
  erro?: string;
}

/**
 * Busca `caminho` com o token. `carregando` vale enquanto a resposta da
 * chamada atual não chega (ao mudar o caminho, volta a carregar).
 * `recarregar()` repete a chamada.
 */
export function useApi<T>(caminho: string | null) {
  const [versao, setVersao] = useState(0);
  const [estado, setEstado] = useState<Estado<T> | null>(null);
  const chave = `${caminho}#${versao}`;

  useEffect(() => {
    if (caminho === null) return;
    let ativo = true;
    apiFetch(caminho)
      .then(async (resposta) => {
        if (!resposta.ok) {
          const erro = await lerErro(resposta, "Não foi possível carregar os dados.");
          if (ativo) setEstado({ chave, erro: erro.mensagem });
          return;
        }
        const dados = (await resposta.json()) as T;
        if (ativo) setEstado({ chave, dados });
      })
      .catch(() => {
        if (ativo) setEstado({ chave, erro: FALHA_REDE.mensagem });
      });
    return () => {
      ativo = false;
    };
  }, [caminho, chave]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  const atual = estado?.chave === chave ? estado : null;

  return {
    dados: atual?.dados,
    erro: atual?.erro,
    carregando: caminho !== null && atual === null,
    recarregar,
  };
}

/** "2026-11-22T15:08:00Z" → "Hoje, 15:08", "Ontem, 10:30" ou "22/11/2026". */
export function formatarQuando(valor: string | null | undefined): string {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";

  const hoje = new Date();
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(hoje) - inicio(data)) / 86_400_000);
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (dias === 0) return `Hoje, ${hora}`;
  if (dias === 1) return `Ontem, ${hora}`;
  return data.toLocaleDateString("pt-BR");
}

export const ROTULO_FUNCAO: Record<string, string> = {
  presidente: "Presidente",
  primeiro_mesario: "1º mesário",
  segundo_mesario: "2º mesário",
  secretario: "Secretário",
  suplente: "Suplente",
};


/**
 * Estado comum das listas do cartório: busca, filtros, página e tamanho da
 * página. Mudar a busca, um filtro ou o tamanho volta para a primeira página.
 */
export function useLista<T, R = undefined>(
  caminho: string,
  filtrosIniciais: Record<string, string> = {},
  limiteInicial = 10,
  fixos: Record<string, string> = {},
) {
  const [q, setQBruto] = useState("");
  const [filtros, setFiltrosBruto] = useState<Record<string, string>>(filtrosIniciais);
  const [pagina, setPagina] = useState(1);
  const [limite, setLimiteBruto] = useState(limiteInicial);

  const api = useApi<Pagina<T, R>>(
    comParametros(caminho, { q, ...filtros, ...fixos, pagina, limite }),
  );

  return {
    ...api,
    q,
    filtros,
    pagina,
    limite,
    setPagina,
    setQ: (texto: string) => {
      setQBruto(texto);
      setPagina(1);
    },
    setFiltro: (chave: string, valor: string) => {
      setFiltrosBruto((f) => ({ ...f, [chave]: valor }));
      setPagina(1);
    },
    limpar: () => {
      setQBruto("");
      setFiltrosBruto(Object.fromEntries(Object.keys(filtrosIniciais).map((k) => [k, ""])));
      setPagina(1);
    },
    setLimite: (n: number) => {
      setLimiteBruto(n);
      setPagina(1);
    },
  };
}
