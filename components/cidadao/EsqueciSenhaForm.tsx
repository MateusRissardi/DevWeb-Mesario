"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { solicitarRedefinicao } from "@/lib/api/acesso";

import { TextField } from "./Field";
import flow from "./Flow.module.css";

export default function EsqueciSenhaForm() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");

    if (!email.trim()) {
      setErro("Informe o e-mail da sua conta.");
      return;
    }

    setEnviando(true);
    const resultado = await solicitarRedefinicao(email.trim());
    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.erro.campos.email ?? resultado.erro.mensagem);
      return;
    }
    setAviso(resultado.dados);
  }

  if (aviso) {
    return (
      <div className={flow.form}>
        <p className={flow.text} role="status">
          {aviso}
        </p>
        <p className={flow.text}>
          O link vale por 30 minutos. Não recebeu? Confira a caixa de spam ou
          tente de novo em alguns minutos.
        </p>
        <Link href="/login">Voltar para o login</Link>
      </div>
    );
  }

  return (
    <form id="form-esqueci-senha" className={flow.form} onSubmit={enviar} noValidate>
      <TextField
        id="esqueci-email"
        label="E-mail"
        obrigatorio
        type="email"
        inputMode="email"
        autoComplete="username"
        placeholder="exemplo@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {erro && (
        <p className={flow.alerta} role="alert">
          {erro}
        </p>
      )}

      <button className={flow.primaryButton} type="submit" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar link"}
      </button>

      <p className={flow.text}>
        <Link href="/login">Voltar para o login</Link>
      </p>
    </form>
  );
}
