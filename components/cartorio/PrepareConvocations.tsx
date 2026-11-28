"use client";

import { useState } from "react";

import {
    BrButton,
    BrCheckbox,
    BrIcon,
    BrModal,
} from "@govbr-ds/webcomponents-react";

import {
    enviar,
    ROTULO_FUNCAO,
    useApi,
    type ConvocacaoLinha,
    type Pagina,
    type ResumoConvocacoes,
} from "@/lib/api/cartorio";

import DataTable, { type DataTableColumn } from "./DataTable";
import { EstadoLista } from "./Controles";
import PageHeader from "./PageHeader";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import modais from "./Modais.module.css";
import styles from "./PrepareConvocations.module.css";

type Etapa = "revisao" | "confirmar" | "concluido";

/** Marca como "convocado" as convocações pendentes escolhidas. Não envia mensagens. */
export default function PrepareConvocations({
    onBack,
}: Readonly<{ onBack: () => void }>) {
    const { dados, erro, carregando, recarregar } = useApi<
        Pagina<ConvocacaoLinha, ResumoConvocacoes>
    >("/api/cartorio/convocacoes?status=pendente&limite=100");

    const [desmarcados, setDesmarcados] = useState<number[]>([]);
    const [etapa, setEtapa] = useState<Etapa>("revisao");
    const [trabalhando, setTrabalhando] = useState(false);
    const [erroEnvio, setErroEnvio] = useState("");
    const [resultado, setResultado] = useState({ atualizadas: 0, ignoradas: 0 });

    const linhas = dados?.itens ?? [];
    const prontas = linhas.filter((l) => l.contato_ok && l.alocacao_id !== null);
    const selecionados = prontas.filter((l) => !desmarcados.includes(l.id));
    const bloqueadas = linhas.length - prontas.length;
    const todosMarcados = prontas.length > 0 && selecionados.length === prontas.length;

    function alternar(id: number) {
        setDesmarcados((atual) =>
            atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
        );
    }

    function alternarTodos() {
        setDesmarcados(todosMarcados ? prontas.map((p) => p.id) : []);
    }

    async function confirmar() {
        setTrabalhando(true);
        setErroEnvio("");
        const r = await enviar<{ atualizadas: number; ignoradas: number }>(
            "POST",
            "/api/cartorio/convocacoes/lote",
            { ids: selecionados.map((s) => s.id) },
        );
        setTrabalhando(false);
        if (!r.ok) {
            setErroEnvio(r.erro.campos.ids ?? r.erro.mensagem);
            return;
        }
        setResultado(r.dados);
        setEtapa("concluido");
    }

    const colunas: readonly DataTableColumn<ConvocacaoLinha>[] = [
        {
            key: "selection",
            label: "Selecionar",
            columnWidth: "64px",
            horizontalAlignment: "center",
            header: (
                <BrCheckbox
                    name="select-all-convocations"
                    checked={todosMarcados}
                    aria-label="Selecionar todas as convocações disponíveis"
                    onChange={alternarTodos}
                />
            ),
            render: (item) => (
                <BrCheckbox
                    name="convocation-selection"
                    value={String(item.id)}
                    checked={selecionados.some((s) => s.id === item.id)}
                    disabled={!item.contato_ok}
                    aria-label={`Selecionar convocação de ${item.nome}`}
                    onChange={() => alternar(item.id)}
                />
            ),
        },
        { key: "person", label: "Pessoa", columnWidth: "0.85fr", render: (r) => r.nome },
        {
            key: "location",
            label: "Local / seção",
            columnWidth: "1.1fr",
            render: (r) => (r.local ? `${r.local} · ${r.numero_secao}` : "—"),
        },
        { key: "role", label: "Função", columnWidth: "0.75fr", render: (r) => (r.funcao ? ROTULO_FUNCAO[r.funcao] : "—") },
        { key: "phone", label: "Telefone", columnWidth: "0.8fr", render: (r) => r.telefone || "—" },
        {
            key: "status",
            label: "Situação",
            columnWidth: "152px",
            render: (r) =>
                r.contato_ok ? (
                    <StatusBadge status={StatusBadgeType.ManifestacaoApta} label="Pronto" />
                ) : (
                    <StatusBadge status={StatusBadgeType.ConvocacaoFalha} label="Sem telefone" />
                ),
        },
    ];

    return (
        <div className={styles.page}>
            <PageHeader
                title="Preparar registros"
                description="Revise as convocações pendentes e registre as que já foram feitas. Nenhuma mensagem é enviada."
            />

            {bloqueadas > 0 && (
                <div className={styles.warning} role="status">
                    <BrIcon iconName="fa6-solid:triangle-exclamation" source="auto" width="18" height="18" aria-hidden="true" />
                    <span>
                        <strong>{bloqueadas} {bloqueadas === 1 ? "convocação está bloqueada" : "convocações estão bloqueadas"}</strong>{" "}
                        por falta de telefone e não {bloqueadas === 1 ? "será incluída" : "serão incluídas"}.
                    </span>
                </div>
            )}

            <section className={styles.summary} aria-label="Resumo das convocações">
                <div>
                    <strong>Pendentes</strong>
                    <span>{linhas.length}</span>
                </div>
                <div>
                    <strong>Prontas</strong>
                    <span>{prontas.length}</span>
                </div>
                <div>
                    <strong>Selecionadas</strong>
                    <span>{selecionados.length}</span>
                </div>
            </section>

            <DataTable
                title="Convocações pendentes"
                columns={colunas}
                rows={linhas}
                getRowKey={(r) => r.id}
                density="medium"
                overflow="wrap"
                footer={
                    <EstadoLista
                        carregando={carregando}
                        erro={erro}
                        vazio={linhas.length === 0}
                        textoVazio="Não há convocações pendentes."
                        onTentarDeNovo={recarregar}
                    />
                }
            />

            <footer className={styles.footer}>
                <p>
                    <strong>{selecionados.length}</strong>{" "}
                    {selecionados.length === 1 ? "convocação selecionada" : "convocações selecionadas"} para registrar
                </p>
                <div className={styles.footerActions}>
                    <BrButton emphasis="secondary" density="small" type="button" onClick={onBack}>
                        Voltar
                    </BrButton>
                    <BrButton
                        emphasis="primary"
                        density="small"
                        type="button"
                        disabled={selecionados.length === 0}
                        onClick={() => setEtapa("confirmar")}
                    >
                        Registrar convocações
                    </BrButton>
                </div>
            </footer>

            {etapa === "confirmar" && (
                <BrModal
                    show
                    autoClose
                    scrollable
                    size="medium"
                    titleText="Registrar convocações"
                    alignFooter="end"
                    onBrModalClose={() => setEtapa("revisao")}
                >
                    <div className={modais.content}>
                        <p>As pessoas abaixo serão marcadas como <strong>convocadas</strong>. Faça o contato por telefone; o sistema não envia mensagens.</p>
                        <ul>
                            {selecionados.map((s) => (
                                <li key={s.id}>
                                    <strong>{s.nome}</strong> · {s.funcao ? ROTULO_FUNCAO[s.funcao] : ""} · {s.local} · seção {s.numero_secao}
                                </li>
                            ))}
                        </ul>
                        {erroEnvio && (
                            <p className={modais.erro} role="alert">
                                {erroEnvio}
                            </p>
                        )}
                    </div>
                    <div slot="footer" className={modais.rodape}>
                        <BrButton emphasis="secondary" density="small" type="button" onClick={() => setEtapa("revisao")}>
                            Cancelar
                        </BrButton>
                        <BrButton emphasis="primary" density="small" type="button" disabled={trabalhando} onClick={confirmar}>
                            {trabalhando ? "Aguarde..." : "Registrar"}
                        </BrButton>
                    </div>
                </BrModal>
            )}

            {etapa === "concluido" && (
                <BrModal
                    show
                    autoClose
                    size="medium"
                    titleText="Registro concluído"
                    alignFooter="end"
                    onBrModalClose={onBack}
                >
                    <div className={modais.content}>
                        <p>
                            <strong>{resultado.atualizadas}</strong>{" "}
                            {resultado.atualizadas === 1 ? "convocação foi registrada" : "convocações foram registradas"} como convocadas.
                        </p>
                        {resultado.ignoradas > 0 && (
                            <p className={modais.aviso}>
                                {resultado.ignoradas} não {resultado.ignoradas === 1 ? "foi alterada" : "foram alteradas"} porque já {resultado.ignoradas === 1 ? "mudou" : "mudaram"} de situação ou {resultado.ignoradas === 1 ? "está" : "estão"} sem telefone.
                            </p>
                        )}
                    </div>
                    <div slot="footer" className={modais.rodape}>
                        <BrButton emphasis="primary" density="small" type="button" onClick={onBack}>
                            Ver lista
                        </BrButton>
                    </div>
                </BrModal>
            )}
        </div>
    );
}
