"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { redefinirSenha } from "@/lib/api/acesso";

import { TextField } from "./Field";
import flow from "./Flow.module.css";

/** O token vem no fragmento (#token=...) do link: não é enviado ao servidor. */
function lerToken(): string {
  return new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token") ?? "";
}
function assinar(aoMudar: () => void) {
  window.addEventListener("hashchange", aoMudar);
  return () => window.removeEventListener("hashchange", aoMudar);
}

export default function RedefinirSenhaForm() {
  const router = useRouter();
  // undefined enquanto hidrata (no servidor não há fragmento).
  const token = useSyncExternalStore<string | undefined>(
    assinar,
    lerToken,
    () => undefined,
  );

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erros, setErros] = useState<{ senha?: string; confirmacao?: string }>({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (token === undefined) return null;

  if (!token) {
    return (
      <div className={flow.form}>
        <p className={flow.alerta} role="alert">
          Link inválido. Abra o link exatamente como veio no e-mail ou peça um
          novo.
        </p>
        <Link href="/esqueci-senha">Pedir novo link</Link>
      </div>
    );
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral("");

    const novos: typeof erros = {};
    if (!senha) novos.senha = "Informe a nova senha.";
    if (senha && confirmacao !== senha) novos.confirmacao = "As senhas não são iguais.";
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setEnviando(true);
    const resultado = await redefinirSenha(token as string, senha);
    setEnviando(false);

    if (!resultado.ok) {
      const { campos, mensagem } = resultado.erro;
      if (campos.senha) setErros({ senha: campos.senha });
      setErroGeral(campos.senha ? "Revise a senha indicada." : mensagem);
      return;
    }
    router.push("/login");
  }

  return (
    <form id="form-redefinir-senha" className={flow.form} onSubmit={enviar} noValidate>
      <TextField
        id="nova-senha"
        label="Nova senha"
        obrigatorio
        type="password"
        autoComplete="new-password"
        dica="Mínimo de 10 caracteres, com letra maiúscula, minúscula e número."
        value={senha}
        erro={erros.senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <TextField
        id="nova-senha-confirmacao"
        label="Confirme a nova senha"
        obrigatorio
        type="password"
        autoComplete="new-password"
        value={confirmacao}
        erro={erros.confirmacao}
        onChange={(e) => setConfirmacao(e.target.value)}
      />

      {erroGeral && (
        <p className={flow.alerta} role="alert">
          {erroGeral}
        </p>
      )}

      <button className={flow.primaryButton} type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar nova senha"}
      </button>

      {erroGeral.includes("expirado") && (
        <p className={flow.text}>
          <Link href="/esqueci-senha">Pedir novo link</Link>
        </p>
      )}
    </form>
  );
}
