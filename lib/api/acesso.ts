import { ehCadastroMesario, criarSessao } from "@/lib/cidadao/cadastro";
import { salvarSessao } from "@/lib/cidadao/sessao";

import { salvarAutenticacao, type UsuarioLogado } from "./auth";
import { apiFetch, lerErro, type ErroApi } from "./client";

export type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: ErroApi };

const FALHA_REDE: ErroApi = {
  mensagem: "Não foi possível conectar ao servidor. Tente novamente.",
  campos: {},
};

/** Destino depois de entrar, conforme o papel. */
export function destinoDoPapel(usuario: UsuarioLogado): string {
  if (usuario.papel !== "mesario") return "/cartorio";
  // Conta nova, ainda sem cadastro de voluntário: segue para o cadastro.
  return usuario.mesario_id === null ? "/cadastro/dados" : "/meus-dados";
}

/** Carrega o cadastro ligado à conta e prepara a sessão das telas do cidadão. */
async function carregarCadastro(usuario: UsuarioLogado): Promise<boolean> {
  if (usuario.mesario_id === null) return false;

  const resposta = await apiFetch(`/api/mesarios/${usuario.mesario_id}`);
  if (!resposta.ok) return false;

  const corpo: unknown = await resposta.json();
  const dados = (corpo as { data?: unknown } | null)?.data;
  if (!ehCadastroMesario(dados)) return false;

  salvarSessao(criarSessao(dados));
  return true;
}

export async function entrar(
  email: string,
  senha: string,
): Promise<Resultado<UsuarioLogado>> {
  try {
    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!resposta.ok) {
      return {
        ok: false,
        erro: await lerErro(resposta, "Não foi possível entrar."),
      };
    }

    const corpo = (await resposta.json()) as {
      token: string;
      expira_em: string;
      usuario: UsuarioLogado;
    };
    salvarAutenticacao(corpo.token, corpo.expira_em, corpo.usuario);

    if (corpo.usuario.papel === "mesario" && corpo.usuario.mesario_id !== null) {
      const carregou = await carregarCadastro(corpo.usuario);
      if (!carregou) {
        return {
          ok: false,
          erro: {
            mensagem:
              "Sua conta ainda não está ligada a um cadastro de mesário. Procure o cartório eleitoral.",
            campos: {},
          },
        };
      }
    }

    return { ok: true, dados: corpo.usuario };
  } catch {
    return { ok: false, erro: FALHA_REDE };
  }
}

export async function criarConta(dados: {
  email: string;
  senha: string;
  cpf?: string;
  titulo_eleitor?: string;
}): Promise<Resultado<null>> {
  try {
    const resposta = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      return {
        ok: false,
        erro: await lerErro(resposta, "Não foi possível criar a conta."),
      };
    }
    return { ok: true, dados: null };
  } catch {
    return { ok: false, erro: FALHA_REDE };
  }
}
