"use client";

import { useState, type ReactNode } from "react";

import { BrButton, BrIcon } from "@govbr-ds/webcomponents-react";

import {
  comParametros,
  enviar,
  ROTULO_FUNCAO,
  useApi,
  type LocalLinha,
  type Pagina,
  type ResumoLocais,
  type ResumoSecoes,
  type SecaoDetalhe,
  type SecaoLinha,
} from "@/lib/api/cartorio";

import CandidatosModal from "./CandidatosModal";
import ConfirmarModal from "./ConfirmarModal";
import { CampoBusca, EstadoLista, FiltroSelect, Paginador } from "./Controles";
import DataTable, { type DataTableColumn } from "./DataTable";
import DetalheVoluntarioModal from "./DetalheVoluntarioModal";
import Historico from "./Historico";
import LocalFormModal from "./LocalFormModal";
import PageHeader from "./PageHeader";
import { SELO_LOCAL, SELO_SELECAO } from "./rotulos";
import SecaoFormModal from "./SecaoFormModal";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./LocationsSectionsFlow.module.css";

const LIMITE = 10;

type Vista =
  | { tipo: "locais" }
  | { tipo: "local"; localId: number }
  | { tipo: "secao"; localId: number; secaoId: number };

type Composicao = SecaoDetalhe["composicao"][number];

function Resumo({ itens, rotulo }: Readonly<{ itens: readonly { label: string; value: number }[]; rotulo: string }>) {
  return (
    <section className={styles.summary} aria-label={rotulo}>
      {itens.map((item) => (
        <div className={styles.summaryItem} key={item.label}>
          <strong>{item.label}</strong>
          <span>{item.value}</span>
        </div>
      ))}
    </section>
  );
}

const Grupo = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>{children}</div>
);

export default function LocationsSectionsFlow() {
  const [vista, setVista] = useState<Vista>({ tipo: "locais" });

  if (vista.tipo === "secao") {
    return (
      <VistaSecao
        secaoId={vista.secaoId}
        onVoltar={() => setVista({ tipo: "local", localId: vista.localId })}
      />
    );
  }
  if (vista.tipo === "local") {
    return (
      <VistaLocal
        localId={vista.localId}
        onVoltar={() => setVista({ tipo: "locais" })}
        onAbrirSecao={(secaoId) => setVista({ tipo: "secao", localId: vista.localId, secaoId })}
      />
    );
  }
  return <VistaLocais onAbrir={(localId) => setVista({ tipo: "local", localId })} />;
}

/* ---------- lista de locais ---------- */

function VistaLocais({ onAbrir }: Readonly<{ onAbrir: (id: number) => void }>) {
  const [q, setQ] = useState("");
  const [situacao, setSituacao] = useState("");
  const [pagina, setPagina] = useState(1);
  const [novo, setNovo] = useState(false);

  const { dados, erro, carregando, recarregar } = useApi<Pagina<LocalLinha, ResumoLocais>>(
    comParametros("/api/cartorio/locais", { q, situacao, pagina, limite: LIMITE }),
  );

  const colunas: readonly DataTableColumn<LocalLinha>[] = [
    { key: "name", label: "Local de votação", columnWidth: "1.2fr", render: (r) => r.nome },
    { key: "city", label: "Município", columnWidth: "0.8fr", render: (r) => r.cidade },
    { key: "zone", label: "Zona", columnWidth: "70px", render: (r) => r.zona_eleitoral },
    { key: "sections", label: "Seções", columnWidth: "80px", render: (r) => r.secoes },
    { key: "complete", label: "Completas", columnWidth: "100px", render: (r) => r.completas },
    { key: "vacancies", label: "Vagas", columnWidth: "80px", render: (r) => r.vagas },
    {
      key: "situation",
      label: "Situação",
      columnWidth: "130px",
      render: (r) => {
        const selo = SELO_LOCAL[r.situacao];
        return <StatusBadge className={styles.badge} status={selo.tipo} label={selo.rotulo} />;
      },
    },
    {
      key: "action",
      label: "Ação",
      columnWidth: "170px",
      horizontalAlignment: "center",
      render: (r) => (
        <BrButton
          className={styles.rowAction}
          emphasis="tertiary"
          density="small"
          type="button"
          aria-label={`Ver seções de ${r.nome}`}
          onClick={() => onAbrir(r.id)}
        >
          Ver seções
          <BrIcon iconName="fa6-solid:arrow-right" source="auto" width="12" height="12" aria-hidden="true" />
        </BrButton>
      ),
    },
  ];

  const r = dados?.resumo;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Locais e seções"
        description="Cadastre os locais de votação e suas seções e acompanhe a composição das mesas."
        action={
          <BrButton emphasis="primary" type="button" onClick={() => setNovo(true)}>
            + Novo local
          </BrButton>
        }
      />
      <Resumo
        rotulo="Resumo de locais e seções"
        itens={[
          { label: "Locais de votação", value: r?.locais ?? 0 },
          { label: "Seções", value: r?.secoes ?? 0 },
          { label: "Seções completas", value: r?.completas ?? 0 },
          { label: "Seções com vagas", value: r?.com_vagas ?? 0 },
        ]}
      />
      <DataTable
        title="Locais da unidade"
        columns={colunas}
        rows={dados?.itens ?? []}
        getRowKey={(x) => x.id}
        density="medium"
        overflow="truncate"
        headerActions={
          <>
            <CampoBusca
              placeholder="Buscar por local, município ou zona..."
              valor={q}
              onBuscar={(t) => {
                setQ(t);
                setPagina(1);
              }}
            />
            <FiltroSelect
              rotulo="Situação"
              valor={situacao}
              opcoes={[
                { valor: "critico", rotulo: "Crítico" },
                { valor: "atencao", rotulo: "Atenção" },
                { valor: "completo", rotulo: "Completo" },
                { valor: "sem_secoes", rotulo: "Sem seções" },
              ]}
              onChange={(v) => {
                setSituacao(v);
                setPagina(1);
              }}
            />
          </>
        }
        footer={
          <>
            <EstadoLista
              carregando={carregando}
              erro={erro}
              vazio={dados?.itens.length === 0}
              textoVazio="Nenhum local cadastrado. Use “+ Novo local” para começar."
              onTentarDeNovo={recarregar}
            />
            <Paginador pagina={pagina} limite={LIMITE} total={dados?.total ?? 0} rotulo="Paginação dos locais da unidade" onPagina={setPagina} />
          </>
        }
      />
      {novo && (
        <LocalFormModal
          onFechar={() => setNovo(false)}
          onSalvo={() => {
            setNovo(false);
            recarregar();
          }}
        />
      )}
    </div>
  );
}

/* ---------- seções de um local ---------- */

function VistaLocal({
  localId,
  onVoltar,
  onAbrirSecao,
}: Readonly<{ localId: number; onVoltar: () => void; onAbrirSecao: (id: number) => void }>) {
  const [q, setQ] = useState("");
  const [situacao, setSituacao] = useState("");
  const [pagina, setPagina] = useState(1);
  const [novaSecao, setNovaSecao] = useState(false);
  const [editar, setEditar] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [trabalhando, setTrabalhando] = useState(false);
  const [erroExcluir, setErroExcluir] = useState("");

  const local = useApi<{ data: LocalLinha }>(`/api/cartorio/locais/${localId}`);
  const secoes = useApi<Pagina<SecaoLinha, ResumoSecoes>>(
    comParametros(`/api/cartorio/locais/${localId}/secoes`, { q, situacao, pagina, limite: LIMITE }),
  );

  async function excluirLocal() {
    setTrabalhando(true);
    setErroExcluir("");
    const r = await enviar("DELETE", `/api/locais-secoes/locais/${localId}`);
    setTrabalhando(false);
    if (!r.ok) {
      setErroExcluir(r.erro.mensagem);
      return;
    }
    onVoltar();
  }

  const colunas: readonly DataTableColumn<SecaoLinha>[] = [
    { key: "section", label: "Seção", columnWidth: "72px", render: (r) => r.numero_secao },
    { key: "president", label: "Presidente", columnWidth: "1.15fr", render: (r) => <span className={r.presidente ? undefined : styles.vacancyText}>{r.presidente ?? "Vaga"}</span> },
    { key: "first", label: "1º mesário", columnWidth: "1.1fr", render: (r) => <span className={r.primeiro_mesario ? undefined : styles.vacancyText}>{r.primeiro_mesario ?? "Vaga"}</span> },
    { key: "second", label: "2º mesário", columnWidth: "1.1fr", render: (r) => <span className={r.segundo_mesario ? undefined : styles.vacancyText}>{r.segundo_mesario ?? "Vaga"}</span> },
    { key: "secretary", label: "Secretário", columnWidth: "1.1fr", render: (r) => <span className={r.secretario ? undefined : styles.vacancyText}>{r.secretario ?? "Vaga"}</span> },
    {
      key: "situation",
      label: "Situação",
      columnWidth: "104px",
      render: (r) => (
        <StatusBadge
          className={styles.badge}
          status={r.vagas ? StatusBadgeType.LocalAtencao : StatusBadgeType.LocalCompleto}
          label={r.vagas ? `${r.vagas} ${r.vagas === 1 ? "vaga" : "vagas"}` : "Completa"}
        />
      ),
    },
    {
      key: "action",
      label: "Ação",
      columnWidth: "72px",
      horizontalAlignment: "center",
      render: (r) => (
        <BrButton className={styles.iconAction} emphasis="tertiary" shape="circle" type="button" aria-label={`Abrir seção ${r.numero_secao}`} onClick={() => onAbrirSecao(r.id)}>
          <BrIcon iconName="fa6-solid:chevron-right" source="auto" width="12" height="12" aria-hidden="true" />
        </BrButton>
      ),
    },
  ];

  const l = local.dados?.data;
  const r = secoes.dados?.resumo;

  return (
    <div className={styles.page}>
      <PageHeader
        title={l?.nome ?? "Local de votação"}
        description={l ? `${l.cidade}/${l.uf} · ${l.zona_eleitoral}ª Zona Eleitoral · ${l.endereco}${l.bairro ? `, ${l.bairro}` : ""}` : undefined}
        action={
          <Grupo>
            <BrButton emphasis="secondary" density="small" type="button" onClick={onVoltar}>Voltar</BrButton>
            <BrButton emphasis="primary" density="small" type="button" onClick={() => setNovaSecao(true)}>+ Nova seção</BrButton>
            <BrButton emphasis="secondary" density="small" type="button" disabled={!l} onClick={() => setEditar(true)}>Editar local</BrButton>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => { setErroExcluir(""); setExcluir(true); }}>Excluir local</BrButton>
          </Grupo>
        }
      />
      {local.erro && <p role="alert">{local.erro}</p>}
      <Resumo
        rotulo="Resumo do local"
        itens={[
          { label: "Seções", value: r?.secoes ?? 0 },
          { label: "Completas", value: r?.completas ?? 0 },
          { label: "Com vagas", value: r?.com_vagas ?? 0 },
          { label: "Vagas abertas", value: r?.vagas_abertas ?? 0 },
        ]}
      />
      <DataTable
        title="Seções do local"
        columns={colunas}
        rows={secoes.dados?.itens ?? []}
        getRowKey={(x) => x.id}
        density="medium"
        overflow="truncate"
        headerActions={
          <>
            <CampoBusca
              placeholder="Buscar por seção ou pessoa..."
              valor={q}
              onBuscar={(t) => {
                setQ(t);
                setPagina(1);
              }}
            />
            <FiltroSelect
              rotulo="Situação"
              valor={situacao}
              opcoes={[
                { valor: "com_vaga", rotulo: "Com vaga" },
                { valor: "completa", rotulo: "Completa" },
              ]}
              onChange={(v) => {
                setSituacao(v);
                setPagina(1);
              }}
            />
          </>
        }
        footer={
          <>
            <EstadoLista
              carregando={secoes.carregando}
              erro={secoes.erro}
              vazio={secoes.dados?.itens.length === 0}
              textoVazio="Nenhuma seção. Use “+ Nova seção” para cadastrar."
              onTentarDeNovo={secoes.recarregar}
            />
            <Paginador pagina={pagina} limite={LIMITE} total={secoes.dados?.total ?? 0} rotulo="Paginação das seções do local" onPagina={setPagina} />
          </>
        }
      />

      {novaSecao && (
        <SecaoFormModal
          localId={localId}
          onFechar={() => setNovaSecao(false)}
          onSalvo={() => {
            setNovaSecao(false);
            secoes.recarregar();
            local.recarregar();
          }}
        />
      )}
      {editar && l && (
        <LocalFormModal
          local={l}
          onFechar={() => setEditar(false)}
          onSalvo={() => {
            setEditar(false);
            local.recarregar();
          }}
        />
      )}
      {excluir && (
        <ConfirmarModal
          titulo="Excluir local"
          texto={`Excluir “${l?.nome ?? "este local"}” e todas as suas seções? Só é possível se ninguém estiver alocado nelas.`}
          confirmar="Excluir local"
          trabalhando={trabalhando}
          erro={erroExcluir}
          onConfirmar={excluirLocal}
          onFechar={() => setExcluir(false)}
        />
      )}
    </div>
  );
}

/* ---------- composição de uma seção ---------- */

function VistaSecao({ secaoId, onVoltar }: Readonly<{ secaoId: number; onVoltar: () => void }>) {
  const secao = useApi<{ data: SecaoDetalhe }>(`/api/cartorio/secoes/${secaoId}`);
  const [buscar, setBuscar] = useState<string | null>(null);
  const [remover, setRemover] = useState<Composicao | null>(null);
  const [excluir, setExcluir] = useState(false);
  const [perfil, setPerfil] = useState<number | null>(null);
  const [trabalhando, setTrabalhando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");

  const s = secao.dados?.data;
  const descricao = s ? `Seção ${s.numero_secao} · ${s.local.nome}` : "";

  async function removerAlocacao() {
    if (!remover?.alocacao_id) return;
    setTrabalhando(true);
    setErroAcao("");
    const r = await enviar("DELETE", `/api/cartorio/alocacoes/${remover.alocacao_id}`);
    setTrabalhando(false);
    if (!r.ok) {
      setErroAcao(r.erro.mensagem);
      return;
    }
    setRemover(null);
    secao.recarregar();
  }

  async function excluirSecao() {
    setTrabalhando(true);
    setErroAcao("");
    const r = await enviar("DELETE", `/api/locais-secoes/${secaoId}`);
    setTrabalhando(false);
    if (!r.ok) {
      setErroAcao(r.erro.mensagem);
      return;
    }
    onVoltar();
  }

  const colunas: readonly DataTableColumn<Composicao>[] = [
    { key: "role", label: "Função", columnWidth: "160px", render: (r) => ROTULO_FUNCAO[r.funcao] },
    { key: "person", label: "Pessoa", columnWidth: "fill", render: (r) => r.nome ?? "—" },
    {
      key: "situation",
      label: "Situação",
      columnWidth: "190px",
      render: (r) => {
        if (!r.alocacao_id) {
          return <StatusBadge className={styles.compositionBadge} status={StatusBadgeType.PrioridadeCritica} label="Vaga não preenchida" />;
        }
        const selo = SELO_SELECAO[r.selecao ?? "pre_selecionado"];
        return <StatusBadge className={styles.compositionBadge} status={selo.tipo} label={selo.rotulo} />;
      },
    },
    {
      key: "action",
      label: "Ação",
      columnWidth: "220px",
      horizontalAlignment: "center",
      render: (r) =>
        r.alocacao_id ? (
          <>
          <BrButton className={styles.rowAction} emphasis="tertiary" density="small" type="button" aria-label={`Ver perfil de ${r.nome}`} onClick={() => setPerfil(r.mesario_id)}>
            Ver perfil
          </BrButton>
          <BrButton className={styles.rowAction} emphasis="tertiary" density="small" type="button" aria-label={`Remover ${r.nome} da função ${ROTULO_FUNCAO[r.funcao]}`} onClick={() => { setErroAcao(""); setRemover(r); }}>
            Remover
          </BrButton>
          </>
        ) : (
          <BrButton className={styles.rowAction} emphasis="tertiary" density="small" type="button" aria-label={`Encontrar voluntário para ${ROTULO_FUNCAO[r.funcao]}`} onClick={() => setBuscar(r.funcao)}>
            Encontrar voluntário
            <BrIcon iconName="fa6-solid:arrow-right" source="auto" width="12" height="12" aria-hidden="true" />
          </BrButton>
        ),
    },
  ];

  const vagas = s?.vagas ?? 0;
  const faltam = s?.composicao.filter((c) => c.funcao !== "suplente" && !c.alocacao_id).map((c) => ROTULO_FUNCAO[c.funcao]) ?? [];

  return (
    <div className={styles.page}>
      <PageHeader
        title={s ? `Seção ${s.numero_secao}` : "Seção"}
        description={s ? `${s.local.nome} · ${s.local.cidade}/${s.local.uf} · ${s.local.zona_eleitoral}ª Zona Eleitoral` : undefined}
        action={
          <Grupo>
            <BrButton emphasis="secondary" density="small" type="button" onClick={onVoltar}>Voltar</BrButton>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => { setErroAcao(""); setExcluir(true); }}>Excluir seção</BrButton>
          </Grupo>
        }
      />
      {secao.erro && <p role="alert">{secao.erro}</p>}

      {s && (
        <section className={styles.sectionStatus} aria-label="Situação da seção">
          <strong>Situação da seção</strong>
          <span>{vagas === 0 ? "Mesa completa" : `${vagas} ${vagas === 1 ? "vaga aberta" : "vagas abertas"} · ${faltam.join(", ")}`}</span>
          <StatusBadge className={styles.badge} status={vagas === 0 ? StatusBadgeType.LocalCompleto : StatusBadgeType.LocalAtencao} />
        </section>
      )}

      <DataTable
        title="Composição da mesa"
        columns={colunas}
        rows={s?.composicao ?? []}
        getRowKey={(c) => c.alocacao_id ?? c.funcao}
        density="medium"
        overflow="truncate"
        footer={<EstadoLista carregando={secao.carregando} erro={secao.erro} vazio={false} textoVazio="" onTentarDeNovo={secao.recarregar} />}
      />

      {s && (
        <section className={styles.operationalNotes}>
          <h3>Suplentes</h3>
          <p>Suplentes não ocupam vaga da mesa. Você pode adicionar quantos forem necessários.</p>
          <BrButton emphasis="secondary" density="small" type="button" onClick={() => setBuscar("suplente")}>
            + Adicionar suplente
          </BrButton>
        </section>
      )}

      {s && (
        <section className={styles.operationalNotes}>
          <h3>Histórico recente</h3>
          <Historico eventos={s.historico} vazio="Nenhum registro para esta seção ainda." />
        </section>
      )}

      {perfil !== null && <DetalheVoluntarioModal id={perfil} onFechar={() => setPerfil(null)} />}

      {buscar && s && (
        <CandidatosModal
          secaoId={secaoId}
          funcao={buscar}
          descricao={descricao}
          onAlocado={secao.recarregar}
          onFechar={() => setBuscar(null)}
        />
      )}
      {remover && (
        <ConfirmarModal
          titulo="Remover pré-seleção"
          texto={`${remover.nome} deixará de ocupar a função de ${ROTULO_FUNCAO[remover.funcao]}. A convocação ficará registrada como cancelada.`}
          confirmar="Remover"
          trabalhando={trabalhando}
          erro={erroAcao}
          onConfirmar={removerAlocacao}
          onFechar={() => setRemover(null)}
        />
      )}
      {excluir && (
        <ConfirmarModal
          titulo="Excluir seção"
          texto="Excluir esta seção? Só é possível se ninguém estiver alocado nela."
          confirmar="Excluir seção"
          trabalhando={trabalhando}
          erro={erroAcao}
          onConfirmar={excluirSecao}
          onFechar={() => setExcluir(false)}
        />
      )}
    </div>
  );
}
