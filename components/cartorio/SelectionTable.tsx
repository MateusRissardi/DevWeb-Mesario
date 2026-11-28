"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrButton, BrIcon, BrModal } from "@govbr-ds/webcomponents-react";

import {
  enviar,
  formatarQuando,
  ROTULO_FUNCAO,
  useLista,
  type AlocacaoLinha,
  type ResultadoConfirmacao,
  type ResumoAlocacoes,
} from "@/lib/api/cartorio";

import ConfirmarModal from "./ConfirmarModal";
import { BarraFiltros, ChipsFiltros, EstadoLista, RodapeLista, type DefinicaoFiltro } from "./Controles";
import DataTable, { type DataTableColumn } from "./DataTable";
import PageHeader from "./PageHeader";
import { SELO_SELECAO } from "./rotulos";
import SelectionSummary from "./SelectionSummary";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import modais from "./Modais.module.css";
import styles from "./SelectionTable.module.css";

const SELECOES = [
  { valor: "pre_selecionado", rotulo: "Pré-selecionado" },
  { valor: "selecionado", rotulo: "Selecionado" },
] as const;

const ALERTAS = [
  { valor: "com", rotulo: "Com alerta" },
  { valor: "sem", rotulo: "Sem alerta" },
] as const;

type Modo = "lista" | "revisar";

export default function SelecaoTable() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("lista");
  const [remover, setRemover] = useState<AlocacaoLinha | null>(null);
  const [bloqueio, setBloqueio] = useState<AlocacaoLinha | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemover, setErroRemover] = useState("");

  // As duas visões têm filtros e páginas próprios; "revisar" só mostra pré-selecionados.
  const lista = useLista<AlocacaoLinha, ResumoAlocacoes>("/api/cartorio/alocacoes", { selecao: "", alerta: "" });
  const revisao = useLista<AlocacaoLinha, ResumoAlocacoes>(
    "/api/cartorio/alocacoes",
    { alerta: "" },
    20,
    { selecao: "pre_selecionado" },
  );
  const [marcados, setMarcados] = useState<ReadonlySet<number>>(new Set());
  const [confirmando, setConfirmando] = useState(false);
  const [trabalhando, setTrabalhando] = useState(false);
  const [erroConfirmar, setErroConfirmar] = useState("");
  const [resultado, setResultado] = useState<ResultadoConfirmacao | null>(null);

  function recarregarTudo() {
    lista.recarregar();
    revisao.recarregar();
  }

  async function confirmarRemocao() {
    if (!remover) return;
    setRemovendo(true);
    setErroRemover("");
    const r = await enviar("DELETE", `/api/cartorio/alocacoes/${remover.id}`);
    setRemovendo(false);
    if (!r.ok) {
      setErroRemover(r.erro.mensagem);
      return;
    }
    setRemover(null);
    setBloqueio(null);
    setMarcados((m) => {
      const novo = new Set(m);
      novo.delete(remover.id);
      return novo;
    });
    recarregarTudo();
  }

  async function confirmarSelecoes() {
    setTrabalhando(true);
    setErroConfirmar("");
    const r = await enviar<ResultadoConfirmacao>("POST", "/api/cartorio/alocacoes/confirmar", {
      ids: [...marcados].map(String),
    });
    setTrabalhando(false);
    if (!r.ok) {
      setErroConfirmar(r.erro.mensagem);
      return;
    }
    setConfirmando(false);
    setResultado(r.dados);
    setMarcados(new Set());
    recarregarTudo();
  }

  const botaoRemover = (r: AlocacaoLinha) => (
    <BrButton
      className={styles.actionButton}
      emphasis="tertiary"
      shape="circle"
      type="button"
      aria-label={`Remover pré-seleção de ${r.nome}`}
      onClick={() => {
        setErroRemover("");
        setRemover(r);
      }}
    >
      <BrIcon iconName="fa6-solid:trash" source="auto" width="16" height="16" aria-hidden="true" />
    </BrButton>
  );

  const colunasBase: DataTableColumn<AlocacaoLinha>[] = [
    { key: "person", label: "Pessoa", columnWidth: "1.2fr", render: (r) => r.nome },
    { key: "place", label: "Local e seção", columnWidth: "1.3fr", render: (r) => `${r.local} · ${r.numero_secao}` },
    { key: "post", label: "Função", columnWidth: "0.9fr", render: (r) => ROTULO_FUNCAO[r.funcao] },
    {
      key: "situation",
      label: "Situação",
      columnWidth: "1fr",
      render: (r) => {
        const selo = SELO_SELECAO[r.selecao];
        return <StatusBadge className={styles.badge} status={selo.tipo} label={selo.rotulo} />;
      },
    },
    {
      key: "alert",
      label: "Alerta",
      columnWidth: "1fr",
      render: (r) =>
        r.alertas.length > 0 ? (
          <StatusBadge className={styles.badge} status={StatusBadgeType.ComAlerta} label={r.alertas[0]} />
        ) : (
          <StatusBadge className={styles.badge} status={StatusBadgeType.SemAlerta} />
        ),
    },
  ];

  const colunasLista: readonly DataTableColumn<AlocacaoLinha>[] = [
    ...colunasBase,
    { key: "alteredAt", label: "Alterado em", columnWidth: "1fr", render: (r) => formatarQuando(r.atualizado_em) },
    {
      key: "action",
      label: "Ação",
      columnWidth: "96px",
      horizontalAlignment: "center",
      render: (r) =>
        r.bloqueada ? (
          <BrButton
            className={styles.actionButton}
            emphasis="tertiary"
            shape="circle"
            type="button"
            aria-label={`Ver bloqueio de ${r.nome}`}
            onClick={() => setBloqueio(r)}
          >
            <BrIcon iconName="fa6-solid:triangle-exclamation" source="auto" width="16" height="16" aria-hidden="true" />
          </BrButton>
        ) : (
          botaoRemover(r)
        ),
    },
  ];

  const itensRevisao = revisao.dados?.itens ?? [];
  const prontasPagina = itensRevisao.filter((r) => !r.bloqueada);
  const todasMarcadas = prontasPagina.length > 0 && prontasPagina.every((r) => marcados.has(r.id));

  function alternar(id: number) {
    setMarcados((m) => {
      const novo = new Set(m);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarTodas() {
    setMarcados((m) => {
      const novo = new Set(m);
      for (const r of prontasPagina) {
        if (todasMarcadas) novo.delete(r.id);
        else novo.add(r.id);
      }
      return novo;
    });
  }

  const colunasRevisao: readonly DataTableColumn<AlocacaoLinha>[] = [
    {
      key: "check",
      label: "",
      columnWidth: "48px",
      render: (r) => (
        <input
          type="checkbox"
          aria-label={`Selecionar ${r.nome}`}
          checked={marcados.has(r.id)}
          disabled={r.bloqueada}
          onChange={() => alternar(r.id)}
        />
      ),
    },
    ...colunasBase.filter((c) => c.key !== "situation"),
    {
      key: "action",
      label: "Ação",
      columnWidth: "96px",
      horizontalAlignment: "center",
      render: (r) => (r.bloqueada ? (
        <BrButton
          className={styles.actionButton}
          emphasis="tertiary"
          shape="circle"
          type="button"
          aria-label={`Ver bloqueio de ${r.nome}`}
          onClick={() => setBloqueio(r)}
        >
          <BrIcon iconName="fa6-solid:triangle-exclamation" source="auto" width="16" height="16" aria-hidden="true" />
        </BrButton>
      ) : botaoRemover(r)),
    },
  ];

  const filtrosLista: DefinicaoFiltro[] = [
    { chave: "selecao", rotulo: "Situação", valor: lista.filtros.selecao, opcoes: SELECOES },
    { chave: "alerta", rotulo: "Alerta", valor: lista.filtros.alerta, opcoes: ALERTAS },
  ];
  const filtrosRevisao: DefinicaoFiltro[] = [
    { chave: "alerta", rotulo: "Alerta", valor: revisao.filtros.alerta, opcoes: ALERTAS },
  ];

  const resumo = lista.dados?.resumo ?? revisao.dados?.resumo;
  const prontas = resumo?.prontas ?? 0;
  const bloqueadas = resumo?.bloqueadas ?? 0;

  return (
    <>
      <PageHeader
        title="Seleção"
        description="Revise as pré-seleções e as confirmações antes de seguir para as convocações."
        action={
          modo === "lista" ? (
            <BrButton emphasis="primary" type="button" onClick={() => setModo("revisar")}>
              Revisar pré-seleções
            </BrButton>
          ) : (
            <BrButton emphasis="secondary" type="button" onClick={() => setModo("lista")}>
              Voltar para a seleção
            </BrButton>
          )
        }
      />

      <SelectionSummary
        ariaLabel="Resumo das seleções"
        items={[
          { label: "Selecionados", value: resumo?.selecionados ?? 0 },
          { label: "Pré-selecionados", value: resumo?.pre_selecionados ?? 0 },
          { label: "Com alertas", value: resumo?.com_alerta ?? 0 },
          { label: "Vagas abertas", value: resumo?.vagas_abertas ?? 0 },
        ]}
      />

      {modo === "lista" ? (
        <DataTable
          title="Seleção da unidade"
          columns={colunasLista}
          rows={lista.dados?.itens ?? []}
          getRowKey={(r) => r.id}
          density="medium"
          overflow="truncate"
          headerActions={
            <BarraFiltros
              placeholder="Buscar por nome, local ou seção..."
              busca={lista.q}
              onBuscar={lista.setQ}
              filtros={filtrosLista}
              onFiltro={lista.setFiltro}
              onLimpar={lista.limpar}
            />
          }
          headerContent={
            <ChipsFiltros filtros={filtrosLista} busca={lista.q} onFiltro={lista.setFiltro} onBuscar={lista.setQ} />
          }
          footer={
            <>
              <EstadoLista
                carregando={lista.carregando}
                erro={lista.erro}
                vazio={lista.dados?.itens.length === 0}
                textoVazio="Nenhuma pré-seleção ainda. Aloque voluntários em Locais e seções."
                onTentarDeNovo={lista.recarregar}
              />
              <RodapeLista
                pagina={lista.pagina}
                limite={lista.limite}
                total={lista.dados?.total ?? 0}
                onPagina={lista.setPagina}
                onLimite={lista.setLimite}
                unidade="itens"
              />
            </>
          }
        />
      ) : (
        <>
          <section className={modais.aviso} aria-label="Resumo da revisão">
            <strong>{prontas} {prontas === 1 ? "pré-seleção pronta" : "pré-seleções prontas"}</strong> para confirmar.{" "}
            {bloqueadas > 0
              ? `${bloqueadas} com alertas bloqueantes (interesse retirado) não podem ser confirmadas; remova a pré-seleção ou trate a pendência.`
              : "Nenhum alerta bloqueante."}
          </section>
          <DataTable
            title="Revisar pré-seleções"
            columns={colunasRevisao}
            rows={itensRevisao}
            getRowKey={(r) => r.id}
            density="medium"
            overflow="truncate"
            headerActions={
              <>
                <BarraFiltros
                  placeholder="Buscar por nome, local ou seção..."
                  busca={revisao.q}
                  onBuscar={revisao.setQ}
                  filtros={filtrosRevisao}
                  onFiltro={revisao.setFiltro}
                  onLimpar={revisao.limpar}
                />
                <label className={modais.opcao}>
                  <input type="checkbox" checked={todasMarcadas} onChange={alternarTodas} disabled={prontasPagina.length === 0} />
                  Selecionar todas desta página
                </label>
                <BrButton
                  emphasis="primary"
                  density="small"
                  type="button"
                  disabled={marcados.size === 0}
                  onClick={() => {
                    setErroConfirmar("");
                    setConfirmando(true);
                  }}
                >
                  {marcados.size === 1 ? "Confirmar 1 seleção" : `Confirmar ${marcados.size} seleções`}
                </BrButton>
              </>
            }
            headerContent={
              <ChipsFiltros filtros={filtrosRevisao} busca={revisao.q} onFiltro={revisao.setFiltro} onBuscar={revisao.setQ} />
            }
            footer={
              <>
                <EstadoLista
                  carregando={revisao.carregando}
                  erro={revisao.erro}
                  vazio={revisao.dados?.itens.length === 0}
                  textoVazio="Nenhuma pré-seleção para revisar."
                  onTentarDeNovo={revisao.recarregar}
                />
                <RodapeLista
                  pagina={revisao.pagina}
                  limite={revisao.limite}
                  total={revisao.dados?.total ?? 0}
                  onPagina={revisao.setPagina}
                  onLimite={revisao.setLimite}
                  unidade="pré-seleções"
                />
              </>
            }
          />
        </>
      )}

      {remover && (
        <ConfirmarModal
          titulo="Remover pré-seleção"
          texto={`${remover.nome} deixará de ocupar a função de ${ROTULO_FUNCAO[remover.funcao]} na seção ${remover.numero_secao} (${remover.local}). A convocação ficará registrada como cancelada.`}
          confirmar="Remover pré-seleção"
          trabalhando={removendo}
          erro={erroRemover}
          onConfirmar={confirmarRemocao}
          onFechar={() => setRemover(null)}
        />
      )}

      {bloqueio && !remover && (
        <BrModal show autoClose size="medium" titleText="Pré-seleção bloqueada" alignFooter="end" onBrModalClose={() => setBloqueio(null)}>
          <div className={modais.content}>
            <p>
              <strong>{bloqueio.nome}</strong> · {ROTULO_FUNCAO[bloqueio.funcao]} · seção {bloqueio.numero_secao} ({bloqueio.local})
            </p>
            <ul>
              {bloqueio.alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            {bloqueio.bloqueada && (
              <p className={modais.aviso}>
                O voluntário retirou o interesse, então esta pré-seleção não pode ser confirmada. Remova-a para
                liberar a vaga para outra pessoa.
              </p>
            )}
          </div>
          <div slot="footer" className={modais.rodape}>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => setBloqueio(null)}>
              Fechar
            </BrButton>
            <BrButton
              emphasis="primary"
              density="small"
              type="button"
              onClick={() => {
                setErroRemover("");
                setRemover(bloqueio);
              }}
            >
              Remover pré-seleção
            </BrButton>
          </div>
        </BrModal>
      )}

      {confirmando && (
        <ConfirmarModal
          titulo="Confirmar seleções"
          texto={`${marcados.size === 1 ? "1 pré-seleção passará" : `${marcados.size} pré-seleções passarão`} a "selecionado". Depois disso elas ficam liberadas para a etapa de convocações. Nenhuma mensagem é enviada.`}
          confirmar={marcados.size === 1 ? "Confirmar 1 seleção" : `Confirmar ${marcados.size} seleções`}
          trabalhando={trabalhando}
          erro={erroConfirmar}
          onConfirmar={confirmarSelecoes}
          onFechar={() => setConfirmando(false)}
        />
      )}

      {resultado && (
        <BrModal show autoClose size="medium" titleText="Seleção concluída" alignFooter="end" onBrModalClose={() => setResultado(null)}>
          <div className={modais.content}>
            <p role="status">
              <strong>{resultado.confirmadas}</strong> {resultado.confirmadas === 1 ? "seleção confirmada" : "seleções confirmadas"}.
            </p>
            {resultado.bloqueadas.length > 0 && (
              <p className={modais.aviso}>
                {resultado.bloqueadas.length} não {resultado.bloqueadas.length === 1 ? "foi confirmada" : "foram confirmadas"} por alerta bloqueante.
              </p>
            )}
            {resultado.ignoradas.length > 0 && (
              <p>{resultado.ignoradas.length} já {resultado.ignoradas.length === 1 ? "estava confirmada ou foi removida" : "estavam confirmadas ou foram removidas"}.</p>
            )}
          </div>
          <div slot="footer" className={modais.rodape}>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => setResultado(null)}>
              Fechar
            </BrButton>
            <BrButton emphasis="primary" density="small" type="button" onClick={() => router.push("/cartorio/convocacoes")}>
              Ir para convocações
            </BrButton>
          </div>
        </BrModal>
      )}
    </>
  );
}
