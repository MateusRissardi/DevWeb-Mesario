import { encerrarAcesso, obterToken } from "./auth";

export interface ErroApi {
  mensagem: string;
  campos: Record<string, string>;
}

export async function apiFetch(
  caminho: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = obterToken();
  const headers = new Headers(init.headers);

  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const resposta = await fetch(caminho, { ...init, headers });

  if (resposta.status === 401 && token) {
    encerrarAcesso();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return resposta;
}

export async function lerErro(
  resposta: Response,
  padrao = "Não foi possível concluir a operação.",
): Promise<ErroApi> {
  try {
    const corpo: unknown = await resposta.json();
    if (corpo && typeof corpo === "object") {
      const { erro, campos } = corpo as { erro?: unknown; campos?: unknown };
      return {
        mensagem: typeof erro === "string" ? erro : padrao,
        campos:
          campos && typeof campos === "object"
            ? (campos as Record<string, string>)
            : {},
      };
    }
  } catch {
  }
  return { mensagem: padrao, campos: {} };
}
