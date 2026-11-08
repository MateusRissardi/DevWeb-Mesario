"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { destinoDoPapel, entrar } from "@/lib/api/acesso";

import { TextField } from "./Field";
import flow from "./Flow.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!email.trim() || !senha) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    setEnviando(true);
    setErro("");

    const resultado = await entrar(email.trim(), senha);
    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.erro.mensagem);
      return;
    }

    router.push(destinoDoPapel(resultado.dados));
  }

  return (
    <form id="form-login" className={flow.form} onSubmit={enviar} noValidate>
      <TextField
        id="login-email"
        label="E-mail"
        obrigatorio
        type="email"
        inputMode="email"
        autoComplete="username"
        placeholder="exemplo@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        id="login-senha"
        label="Senha"
        obrigatorio
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      {erro && (
        <p className={flow.text} role="alert">
          {erro}
        </p>
      )}

      <button className={flow.primaryButton} type="submit" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <p className={flow.text}>
        Ainda não tem conta? <Link href="/criar-conta">Criar conta</Link>
      </p>
    </form>
  );
}
