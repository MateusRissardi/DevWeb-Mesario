"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { atualizarSessao, useSessaoComContato } from "@/lib/cidadao/sessao";

import { CheckboxField } from "./Field";
import flow from "./Flow.module.css";
import InfoBox from "./InfoBox";
import WizardNav from "./WizardNav";

const FORM_ID = "form-aceite";

export default function AceiteForm() {
  const router = useRouter();
  const sessao = useSessaoComContato();
  const [aceito, setAceito] = useState(false);

  if (!sessao) {
    return null;
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!aceito) {
      return;
    }

    atualizarSessao((atual) => ({
      ...atual,
      interesse: { status: "ativo", desde: new Date().toISOString() },
    }));

    router.push("/cadastro/sucesso");
  }

  return (
    <>
      <section className={flow.content} aria-labelledby="titulo-etapa">
        <h1 className={flow.sectionTitle} id="titulo-etapa">
          Aceite
        </h1>

        <p className={flow.text}>
          Ao confirmar, seu nome será incluído na lista de voluntários. A
          manifestação de interesse não garante a convocação.
        </p>

        <InfoBox titulo="Informações sobre o voluntariado.">
          <ul>
            <li>
              Qualquer eleitor regular, maior de 18 anos, pode se inscrever
              voluntariamente para atuar como mesário.
            </li>
            <li>
              Os dados preenchidos no formulário que estiverem diferentes do
              cadastro eleitoral não serão atualizados e servirão somente para
              contato referente aos trabalhos nas eleições.
            </li>
          </ul>
        </InfoBox>

        <form
          id={FORM_ID}
          className={flow.form}
          onSubmit={enviar}
          noValidate
        >
          <CheckboxField
            id="aceite"
            checked={aceito}
            onChange={(e) => setAceito(e.target.checked)}
          >
            Li e concordo com os <strong>Termos de Uso</strong> e{" "}
            <strong>Serviço</strong>
          </CheckboxField>

          <button
            className={flow.primaryButton}
            type="submit"
            disabled={!aceito}
          >
            Sim, quero ser mesário
          </button>
        </form>
      </section>

      <WizardNav
        backHref="/cadastro/contato"
        formId={FORM_ID}
        nextDisabled={!aceito}
      />
    </>
  );
}
