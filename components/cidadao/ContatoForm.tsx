"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  emailValido,
  formatarTelefone,
  telefoneValido,
} from "@/lib/cidadao/formatadores";
import {
  atualizarSessao,
  temCadastro,
  temEleitor,
  useSessaoExigida,
  type Contato,
  type SessaoCidadao,
} from "@/lib/cidadao/sessao";

import { CheckboxField, TextField } from "./Field";
import flow from "./Flow.module.css";
import InfoBox from "./InfoBox";
import WizardNav from "./WizardNav";

interface ContatoFormProps {
  /** `cadastro` é a etapa 3 do fluxo; `atualizar` edita os contatos de quem já é voluntário. */
  modo: "cadastro" | "atualizar";
}

export default function ContatoForm({ modo }: Readonly<ContatoFormProps>) {
  const sessao = useSessaoExigida<SessaoCidadao>(
    modo === "atualizar" ? temCadastro : temEleitor,
    modo === "atualizar" ? "/login" : "/cadastro/confirmacao",
  );

  if (!sessao) {
    return null;
  }

  return <Campos modo={modo} contatoInicial={sessao.contato} />;
}

interface CamposProps {
  modo: ContatoFormProps["modo"];
  contatoInicial?: Contato;
}

interface Erros {
  telefone?: string;
  email?: string;
}

const FORM_ID = "form-contato";

function Campos({ modo, contatoInicial }: Readonly<CamposProps>) {
  const router = useRouter();
  const [telefone, setTelefone] = useState(contatoInicial?.telefone ?? "");
  const [whatsapp, setWhatsapp] = useState(contatoInicial?.whatsapp ?? false);
  const [email, setEmail] = useState(contatoInicial?.email ?? "");
  const [erros, setErros] = useState<Erros>({});

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const novosErros: Erros = {};
    const emailLimpo = email.trim();

    if (!telefone) {
      novosErros.telefone = "Informe o telefone para contato.";
    } else if (!telefoneValido(telefone)) {
      novosErros.telefone = "Informe um telefone válido, com DDD.";
    }

    if (emailLimpo && !emailValido(emailLimpo)) {
      novosErros.email = "Informe um e-mail válido.";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    atualizarSessao((atual) => ({
      ...atual,
      contato: { telefone, whatsapp, email: emailLimpo },
    }));

    router.push(
      modo === "cadastro" ? "/cadastro/aceite" : "/meus-dados/atualizado",
    );
  }

  return (
    <>
      <section className={flow.content} aria-labelledby="titulo-etapa">
        <h1 className={flow.sectionTitle} id="titulo-etapa">
          {modo === "cadastro" ? "Contato" : "Atualizar contatos"}
        </h1>

        <form
          id={FORM_ID}
          className={flow.form}
          onSubmit={enviar}
          noValidate
        >
          <TextField
            id="telefone"
            label="Telefone"
            obrigatorio
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            value={telefone}
            erro={erros.telefone}
            onChange={(e) => {
              setTelefone(formatarTelefone(e.target.value));
              setErros((atuais) => ({ ...atuais, telefone: undefined }));
            }}
          />

          <CheckboxField
            id="whatsapp"
            checked={whatsapp}
            onChange={(e) => setWhatsapp(e.target.checked)}
          >
            Este número possui WhatsApp
          </CheckboxField>

          <TextField
            id="email"
            label="E-mail (opcional)"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="exemplo@email.com"
            dica="Informe seu e-mail para contato"
            value={email}
            erro={erros.email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErros((atuais) => ({ ...atuais, email: undefined }));
            }}
          />
        </form>

        <InfoBox titulo="Importante">
          <p>
            A Justiça Eleitoral poderá utilizar esses contatos para informações
            sobre sua participação e eventual convocação.
          </p>
        </InfoBox>

        {modo === "atualizar" && (
          <div className={flow.actions}>
            <button className={flow.primaryButton} type="submit" form={FORM_ID}>
              Salvar
            </button>
            <Link className={flow.secondaryButton} href="/meus-dados">
              Cancelar
            </Link>
          </div>
        )}
      </section>

      {modo === "cadastro" && (
        <WizardNav backHref="/cadastro/confirmacao" formId={FORM_ID} />
      )}
    </>
  );
}
