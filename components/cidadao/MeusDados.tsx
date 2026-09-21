"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { descreverZona, mascararTitulo } from "@/lib/cidadao/formatadores";
import { DIAS_PARA_NOVO_CADASTRO } from "@/lib/cidadao/regras";
import { atualizarSessao, useSessaoCompleta } from "@/lib/cidadao/sessao";

import { DataItem, DataList } from "./DataList";
import flow from "./Flow.module.css";
import StatusCard from "./StatusCard";
import styles from "./MeusDados.module.css";

function dataParaNovoCadastro(desdeIso: string) {
  const data = new Date(desdeIso);
  data.setDate(data.getDate() + DIAS_PARA_NOVO_CADASTRO);

  return data.toLocaleDateString("pt-BR");
}

export default function MeusDados() {
  const router = useRouter();
  const sessao = useSessaoCompleta();
  const dialogo = useRef<HTMLDialogElement>(null);

  if (!sessao) {
    return null;
  }

  const { eleitor, contato, interesse } = sessao;
  const ativo = interesse.status === "ativo";

  function retirarInteresse() {
    atualizarSessao((atual) => ({
      ...atual,
      interesse: { status: "desistiu", desde: new Date().toISOString() },
    }));

    dialogo.current?.close();
    router.push("/meus-dados/interesse-retirado");
  }

  return (
    <section className={flow.content} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">
        Olá, {eleitor.nome.split(" ")[0]}
      </h1>

      <h2 className={flow.sectionTitle}>Meus dados</h2>

      <DataList>
        <DataItem rotulo="Título do eleitor" italico>
          {mascararTitulo(eleitor.titulo)}
        </DataItem>
        <DataItem rotulo="Nome completo">{eleitor.nome}</DataItem>
        <DataItem rotulo="Zona eleitoral" metade>
          {descreverZona(eleitor.zona)}
        </DataItem>
        <DataItem rotulo="Seção eleitoral" metade>
          {eleitor.secao}
        </DataItem>
        <DataItem rotulo="Local de votação">{eleitor.localVotacao}</DataItem>
        <DataItem rotulo="Telefone">{contato.telefone}</DataItem>
        <DataItem rotulo="E-mail">{contato.email || "Não informado"}</DataItem>
      </DataList>

      <StatusCard
        titulo="Status de Interesse"
        status={ativo ? "Interesse ativo" : "Desistiu"}
        variante={ativo ? "sucesso" : "neutro"}
      >
        {ativo
          ? "Você está disponível para ser selecionado(a) pela Justiça Eleitoral."
          : `Você retirou seu interesse. Um novo cadastro só poderá ser feito a partir de ${dataParaNovoCadastro(interesse.desde)}.`}
      </StatusCard>

      <StatusCard
        titulo="Status de Convocação"
        status="Não convocado"
        variante="neutro"
      >
        Caso seja convocado, você receberá as orientações pelos canais oficiais.
      </StatusCard>

      <div className={flow.actions}>
        <Link className={flow.primaryButton} href="/meus-dados/atualizar">
          Atualizar Dados
        </Link>

        {ativo && (
          <button
            className={flow.secondaryButton}
            type="button"
            onClick={() => dialogo.current?.showModal()}
          >
            Retirar Interesse
          </button>
        )}
      </div>

      <dialog
        ref={dialogo}
        className={styles.dialog}
        aria-labelledby="titulo-retirar"
      >
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle} id="titulo-retirar">
            Deseja retirar seu interesse?
          </h2>

          <button
            className={styles.dialogClose}
            type="button"
            aria-label="Fechar"
            onClick={() => dialogo.current?.close()}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.dialogBody}>
          <p>
            Você está retirando seu interesse em ser um mesário voluntário. O
            seu cadastro de voluntariado será desativado.
          </p>

          <p>
            No entanto, informamos que a prestação de serviços eleitorais é
            obrigatória por lei.
          </p>

          <p>
            Esta dispensa do voluntariado{" "}
            <strong>
              não impede que você seja convocado obrigatoriamente
            </strong>{" "}
            pelo Juiz Eleitoral de sua zona, conforme determinação do{" "}
            <strong>Art. 120 do Código Eleitoral</strong>.
          </p>
        </div>

        <div className={styles.dialogActions}>
          <button
            className={flow.secondaryButton}
            type="button"
            onClick={() => dialogo.current?.close()}
          >
            Cancelar
          </button>
          <button
            className={flow.primaryButton}
            type="button"
            onClick={retirarInteresse}
          >
            Retirar interesse
          </button>
        </div>
      </dialog>
    </section>
  );
}
