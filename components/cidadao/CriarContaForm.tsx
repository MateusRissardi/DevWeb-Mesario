"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { criarConta, destinoDoPapel, entrar } from "@/lib/api/acesso";
import {
  formatarIdentificador,
  formatarTitulo,
  somenteDigitos,
} from "@/lib/cidadao/formatadores";

import { TextField } from "./Field";
import flow from "./Flow.module.css";

type Erros = Partial<
  Record<"email" | "senha" | "cpf" | "titulo_eleitor" | "cadastro", string>
>;

export default function CriarContaForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [titulo, setTitulo] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral("");

    const novos: Erros = {};
    if (!email.trim()) novos.email = "Informe o e-mail.";
    if (!senha) novos.senha = "Informe a senha.";
    // CPF e título são opcionais, mas só valem em par: ligam a conta a um cadastro existente.
    const informouCadastro = !!(cpf || titulo);
    if (informouCadastro && somenteDigitos(cpf).length !== 11)
      novos.cpf = "O CPF deve ter 11 dígitos.";
    if (informouCadastro && somenteDigitos(titulo).length !== 12)
      novos.titulo_eleitor = "O título deve ter 12 dígitos.";
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setEnviando(true);
    const criada = await criarConta({
      email: email.trim(),
      senha,
      ...(cpf || titulo
        ? { cpf: somenteDigitos(cpf), titulo_eleitor: somenteDigitos(titulo) }
        : {}),
    });

    if (!criada.ok) {
      setEnviando(false);
      const { campos, mensagem } = criada.erro;
      setErros({
        email: campos.email,
        senha: campos.senha,
        cpf: campos.cpf,
        titulo_eleitor: campos.titulo_eleitor,
        cadastro: campos.cadastro,
      });
      setErroGeral(
        campos.cadastro ??
          (Object.keys(campos).length > 0 ? "Revise os campos indicados." : mensagem),
      );
      return;
    }

    const login = await entrar(email.trim(), senha);
    setEnviando(false);
    if (!login.ok) {
      router.push("/login");
      return;
    }
    router.push(destinoDoPapel(login.dados));
  }

  return (
    <form id="form-criar-conta" className={flow.form} onSubmit={enviar} noValidate>
      <TextField
        id="conta-email"
        label="E-mail"
        obrigatorio
        type="email"
        inputMode="email"
        autoComplete="username"
        placeholder="exemplo@email.com"
        value={email}
        erro={erros.email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        id="conta-senha"
        label="Senha"
        obrigatorio
        type="password"
        autoComplete="new-password"
        dica="Mínimo de 10 caracteres, com letra maiúscula, minúscula e número."
        value={senha}
        erro={erros.senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <TextField
        id="conta-cpf"
        label="CPF (opcional)"
        inputMode="numeric"
        autoComplete="off"
        placeholder="000.000.000-00"
        value={cpf}
        erro={erros.cpf}
        onChange={(e) => setCpf(formatarIdentificador(e.target.value))}
      />

      <TextField
        id="conta-titulo"
        label="Nº do título de eleitor (opcional)"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0000 0000 0000"
        dica="Preencha CPF e título só se você já fez o cadastro de voluntário: assim ligamos a conta a ele. Se não fez, deixe em branco e faça o cadastro depois de entrar."
        value={titulo}
        erro={erros.titulo_eleitor}
        onChange={(e) => setTitulo(formatarTitulo(e.target.value))}
      />

      {erroGeral && (
        <p className={flow.text} role="alert">
          {erroGeral}
        </p>
      )}

      <button className={flow.primaryButton} type="submit" disabled={enviando}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>

      <p className={flow.text}>
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </form>
  );
}
