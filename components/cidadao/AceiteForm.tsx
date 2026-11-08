"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { somenteDigitos } from "@/lib/cidadao/formatadores";
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
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  if (!sessao) {
    return null;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!aceito || salvando || !sessao) {
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      const eleitor = sessao.eleitor;
      const [dia, mes, ano] = eleitor.dataNascimento.split("/");
      const response = await fetch("/api/mesarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: somenteDigitos(eleitor.cpf),
          titulo_eleitor: somenteDigitos(eleitor.titulo),
          nome_civil: eleitor.nome,
          data_nascimento: `${ano}-${mes}-${dia}`,
          nome_mae: eleitor.nomeMae,
          nome_pai: eleitor.nomePai || null,
          municipio: eleitor.municipio,
          zona_eleitoral: Number(eleitor.zona),
          secao_eleitoral: Number(eleitor.secao),
          local_votacao: eleitor.localVotacao,
          telefone: sessao.contato.telefone,
          email: sessao.contato.email || null,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.erro || result.error || result.message || "Não foi possível registrar seu interesse.");
      }

      atualizarSessao((atual) => ({
        ...atual,
        interesse: { status: "ativo", desde: new Date().toISOString() },
      }));

      router.push("/cadastro/sucesso");
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Erro de conexão ao registrar seu interesse. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
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
          {erro && <p className={flow.text} role="alert">{erro}</p>}

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
            disabled={!aceito || salvando}
          >
            {salvando ? "Registrando..." : "Sim, quero ser mesário"}
          </button>
        </form>
      </section>

      <WizardNav
        backHref="/cadastro/contato"
        formId={FORM_ID}
        nextDisabled={!aceito || salvando}
      />
    </>
  );
}
