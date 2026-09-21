"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { consultarCadastro } from "@/lib/cidadao/eleitor-mock";
import {
  formatarIdentificador,
  identificadorValido,
  somenteDigitos,
} from "@/lib/cidadao/formatadores";
import { salvarSessao } from "@/lib/cidadao/sessao";

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

export default function IdentificacaoForm({
  id,
  modo,
  botao,
}: Readonly<IdentificacaoFormProps>) {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erros, setErros] = useState<Erros>({});

  function enviar(evento: FormEvent<HTMLFormElement>) {
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
      // Abre uma sessão nova; os dados pessoais são preenchidos na etapa 2.
      salvarSessao({});
      router.push("/cadastro/confirmacao");
    } else {
      salvarSessao(consultarCadastro());
      router.push("/meus-dados");
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

      {botao && (
        <button className={flow.primaryButton} type="submit">
          {botao}
        </button>
      )}
    </form>
  );
}
