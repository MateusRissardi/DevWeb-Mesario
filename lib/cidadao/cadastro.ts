import { formatarIdentificador, formatarTitulo } from "./formatadores";
import type { SessaoCompleta } from "./sessao";

/** Cadastro de mesário como a API devolve (sem o código do título). */
export interface CadastroMesario {
  id: number;
  cpf: string;
  titulo_eleitor: string;
  nome_civil: string;
  data_nascimento: string;
  nome_mae: string;
  nome_pai: string | null;
  municipio: string;
  zona_eleitoral: number | string;
  secao_eleitoral: number | string;
  local_votacao: string;
  telefone: string | null;
  email: string | null;
  status_interesse: boolean | null;
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function ehCadastroMesario(valor: unknown): valor is CadastroMesario {
  if (!ehObjeto(valor)) return false;

  return (
    typeof valor.id === "number" &&
    typeof valor.cpf === "string" &&
    typeof valor.titulo_eleitor === "string" &&
    typeof valor.nome_civil === "string" &&
    typeof valor.data_nascimento === "string" &&
    typeof valor.nome_mae === "string" &&
    (typeof valor.nome_pai === "string" || valor.nome_pai === null) &&
    typeof valor.municipio === "string" &&
    (typeof valor.zona_eleitoral === "number" ||
      typeof valor.zona_eleitoral === "string") &&
    (typeof valor.secao_eleitoral === "number" ||
      typeof valor.secao_eleitoral === "string") &&
    typeof valor.local_votacao === "string" &&
    (typeof valor.telefone === "string" || valor.telefone === null) &&
    (typeof valor.email === "string" || valor.email === null) &&
    (typeof valor.status_interesse === "boolean" ||
      valor.status_interesse === null)
  );
}

export function criarSessao(mesario: CadastroMesario): SessaoCompleta {
  const data = mesario.data_nascimento
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");

  return {
    eleitor: {
      cpf: formatarIdentificador(mesario.cpf),
      titulo: formatarTitulo(mesario.titulo_eleitor),
      nome: mesario.nome_civil,
      dataNascimento: data,
      nomeMae: mesario.nome_mae,
      nomePai: mesario.nome_pai ?? "",
      municipio: mesario.municipio,
      zona: String(mesario.zona_eleitoral),
      secao: String(mesario.secao_eleitoral),
      localVotacao: mesario.local_votacao,
    },
    contato: {
      telefone: mesario.telefone ?? "",
      whatsapp: false,
      email: mesario.email ?? "",
    },
    interesse: {
      status: mesario.status_interesse === false ? "desistiu" : "ativo",
      desde: new Date().toISOString(),
    },
  };
}
