"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  formatarIdentificador,
  formatarTitulo,
  identificadorValido,
  somenteDigitos,
} from "@/lib/cidadao/formatadores";
import {
  ELEITOR_VAZIO,
  salvarSessao,
  type SessaoCompleta,
} from "@/lib/cidadao/sessao";

import { TextField } from "./Field";
import flow from "./Flow.module.css";

interface IdentificacaoFormProps {
  id: string;
  /** `cadastro` inicia o fluxo de voluntário; `login` abre "Meus dados". */
  modo: "cadastro" | "login";
  /** Rótulo do botão de envio. Sem ele, o envio fica por conta de quem usa o formulário (`form={id}`). */
  botao?: string;
}

interface Erros {
  identificador?: string;
  codigo?: string;
}

interface CadastroMesario {
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

function ehCadastroMesario(valor: unknown): valor is CadastroMesario {
  if (!ehObjeto(valor)) {
    return false;
  }

  return (
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

function criarSessao(mesario: CadastroMesario): SessaoCompleta {
  const data = mesario.data_nascimento.slice(0, 10).split("-").reverse().join("/");

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

export default function IdentificacaoForm({
  id,
  modo,
  botao,
}: Readonly<IdentificacaoFormProps>) {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [erroConsulta, setErroConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const novosErros: Erros = {};

    if (!identificadorValido(identificador)) {
      novosErros.identificador =
        "Informe um CPF (11 dígitos) ou um nº de título (12 dígitos) válido.";
    }

    if (!somenteDigitos(codigo)) {
      novosErros.codigo = "Informe o código de autenticação do e-Título.";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    if (modo === "cadastro") {
      const cpf = somenteDigitos(identificador);
      salvarSessao({
        eleitor: {
          ...ELEITOR_VAZIO,
          cpf: cpf.length === 11 ? formatarIdentificador(cpf) : "",
        },
      });
      router.push("/cadastro/confirmacao");
      return;
    }

    setConsultando(true);
    setErroConsulta("");

    try {
      const resposta = await fetch("/api/mesarios/consultar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificador: somenteDigitos(identificador),
          codigo: somenteDigitos(codigo),
        }),
      });
      const resultado: unknown = await resposta.json();

      if (!resposta.ok) {
        const mensagem = ehObjeto(resultado) &&
          typeof resultado.message === "string"
            ? resultado.message
            : "Não foi possível consultar seu cadastro.";
        throw new Error(mensagem);
      }

      if (!ehObjeto(resultado) || !ehCadastroMesario(resultado.data)) {
        throw new Error("Os dados retornados do cadastro são inválidos.");
      }

      salvarSessao(criarSessao(resultado.data));
      router.push("/meus-dados");
    } catch (erro: unknown) {
      setErroConsulta(
        erro instanceof Error
          ? erro.message
          : "Erro de conexão ao consultar seu cadastro.",
      );
    } finally {
      setConsultando(false);
    }
  }

  return (
    <form id={id} className={flow.form} onSubmit={enviar} noValidate>
      <TextField
        id={`${id}-identificador`}
        label="CPF ou nº do título de eleitor"
        obrigatorio
        inputMode="numeric"
        autoComplete="off"
        placeholder="000.000.000-00"
        value={identificador}
        erro={erros.identificador}
        onChange={(e) => {
          setIdentificador(formatarIdentificador(e.target.value));
          setErros((atuais) => ({ ...atuais, identificador: undefined }));
        }}
      />

      <TextField
        id={`${id}-codigo`}
        label="Código de autenticação"
        obrigatorio
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="Código gerado pelo e-Título"
        dica="Gerado pelo aplicativo e-Título."
        value={codigo}
        erro={erros.codigo}
        onChange={(e) => {
          setCodigo(somenteDigitos(e.target.value));
          setErros((atuais) => ({ ...atuais, codigo: undefined }));
        }}
      />

      {erroConsulta && (
        <p className={flow.text} role="alert">
          {erroConsulta}
        </p>
      )}

      {botao && (
        <button
          className={flow.primaryButton}
          type="submit"
          disabled={consultando}
        >
          {consultando ? "Consultando..." : botao}
        </button>
      )}
    </form>
  );
}
