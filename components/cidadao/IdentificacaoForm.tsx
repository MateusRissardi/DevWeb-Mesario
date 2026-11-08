"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  formatarIdentificador,
  identificadorValido,
  somenteDigitos,
} from "@/lib/cidadao/formatadores";
import { ELEITOR_VAZIO, salvarSessao } from "@/lib/cidadao/sessao";

import { TextField } from "./Field";
import flow from "./Flow.module.css";

interface IdentificacaoFormProps {
  id: string;
}

export default function IdentificacaoForm({
  id,
}: Readonly<IdentificacaoFormProps>) {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [erro, setErro] = useState<string>();

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!identificadorValido(identificador)) {
      setErro("Informe um CPF (11 dígitos) ou um nº de título (12 dígitos) válido.");
      return;
    }

    const cpf = somenteDigitos(identificador);
    salvarSessao({
      eleitor: {
        ...ELEITOR_VAZIO,
        cpf: cpf.length === 11 ? formatarIdentificador(cpf) : "",
      },
    });
    router.push("/cadastro/confirmacao");
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
        erro={erro}
        onChange={(e) => {
          setIdentificador(formatarIdentificador(e.target.value));
          setErro(undefined);
        }}
      />
    </form>
  );
}
