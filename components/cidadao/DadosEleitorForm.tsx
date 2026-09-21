"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  dataNascimentoValida,
  formatarData,
  formatarNumeroEleitoral,
  formatarTitulo,
  tituloValido,
} from "@/lib/cidadao/formatadores";
import {
  ELEITOR_VAZIO,
  atualizarSessao,
  useSessaoIniciada,
  type Eleitor,
} from "@/lib/cidadao/sessao";

import { TextField } from "./Field";
import flow from "./Flow.module.css";
import InfoBox from "./InfoBox";
import WizardNav from "./WizardNav";

const FORM_ID = "form-dados-eleitor";

type Erros = Partial<Record<keyof Eleitor, string>>;

/** Etapa 2: o cidadão informa os próprios dados de eleitor. */
export default function DadosEleitorForm() {
  const sessao = useSessaoIniciada();

  if (!sessao) {
    return null;
  }

  return <Campos eleitorInicial={sessao.eleitor ?? ELEITOR_VAZIO} />;
}

function validar(eleitor: Eleitor): Erros {
  const erros: Erros = {};

  if (!tituloValido(eleitor.titulo)) {
    erros.titulo = "Informe o número do título com 12 dígitos.";
  }

  if (eleitor.nome.trim().split(/\s+/).length < 2) {
    erros.nome = "Informe o nome completo.";
  }

  if (!dataNascimentoValida(eleitor.dataNascimento)) {
    erros.dataNascimento = "Informe uma data válida (dd/mm/aaaa).";
  }

  if (!eleitor.nomeMae.trim()) {
    erros.nomeMae = "Informe o nome da mãe.";
  }

  if (!eleitor.municipio.trim()) {
    erros.municipio = "Informe o município.";
  }

  if (!eleitor.zona) {
    erros.zona = "Informe a zona.";
  }

  if (!eleitor.secao) {
    erros.secao = "Informe a seção.";
  }

  if (!eleitor.localVotacao.trim()) {
    erros.localVotacao = "Informe o local de votação.";
  }

  return erros;
}

function Campos({ eleitorInicial }: Readonly<{ eleitorInicial: Eleitor }>) {
  const router = useRouter();
  const [eleitor, setEleitor] = useState(eleitorInicial);
  const [erros, setErros] = useState<Erros>({});

  const alterar = (campo: keyof Eleitor, valor: string) => {
    setEleitor((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const limpo: Eleitor = {
      ...eleitor,
      nome: eleitor.nome.trim(),
      nomeMae: eleitor.nomeMae.trim(),
      nomePai: eleitor.nomePai.trim(),
      municipio: eleitor.municipio.trim(),
      localVotacao: eleitor.localVotacao.trim(),
    };
    const novosErros = validar(limpo);

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    atualizarSessao((atual) => ({ ...atual, eleitor: limpo }));
    router.push("/cadastro/contato");
  }

  return (
    <>
      <section className={flow.content} aria-labelledby="titulo-etapa">
        <h1 className={flow.sectionTitle} id="titulo-etapa">
          Meus dados
        </h1>

        <form id={FORM_ID} className={flow.form} onSubmit={enviar} noValidate>
          <TextField
            id="titulo"
            label="Título do eleitor"
            obrigatorio
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000 0000 0000"
            value={eleitor.titulo}
            erro={erros.titulo}
            onChange={(e) => alterar("titulo", formatarTitulo(e.target.value))}
          />

          <div className={flow.pair}>
            <TextField
              id="nome"
              label="Nome completo"
              obrigatorio
              autoComplete="name"
              placeholder="Seu nome completo"
              value={eleitor.nome}
              erro={erros.nome}
              onChange={(e) => alterar("nome", e.target.value)}
            />

            <TextField
              id="data-nascimento"
              label="Data de nascimento"
              obrigatorio
              inputMode="numeric"
              autoComplete="bday"
              placeholder="dd/mm/aaaa"
              value={eleitor.dataNascimento}
              erro={erros.dataNascimento}
              onChange={(e) =>
                alterar("dataNascimento", formatarData(e.target.value))
              }
            />
          </div>

          <TextField
            id="nome-mae"
            label="Nome da mãe"
            obrigatorio
            autoComplete="off"
            placeholder="Nome completo da mãe"
            value={eleitor.nomeMae}
            erro={erros.nomeMae}
            onChange={(e) => alterar("nomeMae", e.target.value)}
          />

          <TextField
            id="nome-pai"
            label="Nome do pai (opcional)"
            autoComplete="off"
            placeholder="Nome completo do pai"
            dica="Deixe em branco se não constar no seu título."
            value={eleitor.nomePai}
            onChange={(e) => alterar("nomePai", e.target.value)}
          />

          <TextField
            id="municipio"
            label="Município"
            obrigatorio
            autoComplete="off"
            placeholder="Ex.: Ibirama/SC"
            value={eleitor.municipio}
            erro={erros.municipio}
            onChange={(e) => alterar("municipio", e.target.value)}
          />

          <div className={flow.pair}>
            <TextField
              id="zona"
              label="Zona eleitoral"
              obrigatorio
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ex.: 12"
              value={eleitor.zona}
              erro={erros.zona}
              onChange={(e) =>
                alterar("zona", formatarNumeroEleitoral(e.target.value))
              }
            />

            <TextField
              id="secao"
              label="Seção eleitoral"
              obrigatorio
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ex.: 0154"
              value={eleitor.secao}
              erro={erros.secao}
              onChange={(e) =>
                alterar("secao", formatarNumeroEleitoral(e.target.value))
              }
            />
          </div>

          <TextField
            id="local-votacao"
            label="Local de votação"
            obrigatorio
            autoComplete="off"
            placeholder="Ex.: Escola Municipal Christa Sedlacek"
            value={eleitor.localVotacao}
            erro={erros.localVotacao}
            onChange={(e) => alterar("localVotacao", e.target.value)}
          />
        </form>

        <InfoBox titulo="Preencha com atenção">
          <p>
            Informe os dados exatamente como constam no seu título de eleitor.
          </p>
          <p>Você pode consultá-los no aplicativo e-Título.</p>
        </InfoBox>
      </section>

      <WizardNav formId={FORM_ID} />
    </>
  );
}
