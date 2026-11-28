"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import {
  enviar,
  formatarQuando,
  ROTULO_FUNCAO,
  useApi,
  type VoluntarioDetalhe,
} from "@/lib/api/cartorio";

import EdicaoDadosModal from "./EdicaoDadosModal";
import Historico from "./Historico";
import { SELO_SITUACAO } from "./rotulos";
import StatusBadge from "./StatusBadge";

import styles from "./Modais.module.css";

const ROTULO_ORIGEM = { portal: "Portal", presencial: "Presencial" } as const;

/**
 * Detalhes da manifestação: dados com título mascarado, validações, histórico
 * e as ações da análise (iniciar, marcar como apta, editar, registrar impedimento).
 */
export default function DetalheVoluntarioModal({
  id,
  aviso,
  onMudou,
  onFechar,
  onEncontrarVaga,
}: Readonly<{
  id: number;
  aviso?: string;
  onMudou?: () => void;
  onFechar: () => void;
  onEncontrarVaga?: (id: number) => void;
}>) {
  const { dados, erro, carregando, recarregar } = useApi<{ data: VoluntarioDetalhe }>(
    `/api/cartorio/voluntarios/${id}`,
  );
  const m = dados?.data;
  const [agindo, setAgindo] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [editando, setEditando] = useState(false);
  const [impedimento, setImpedimento] = useState<string | null>(null);

  function mudou() {
    onMudou?.();
    recarregar();
  }

  async function analisar(acao: "iniciar" | "marcar_apta") {
    setAgindo(true);
    setErroAcao("");
    const r = await enviar("POST", `/api/cartorio/voluntarios/${id}/analise`, { acao });
    setAgindo(false);
    if (!r.ok) {
      setErroAcao(r.erro.mensagem);
      return;
    }
    mudou();
  }

  async function registrarImpedimento() {
    const contexto = (impedimento ?? "").trim();
    if (!contexto) {
      setErroAcao("Informe o motivo do impedimento.");
      return;
    }
    setAgindo(true);
    setErroAcao("");
    const r = await enviar("POST", "/api/cartorio/pendencias", { mesario_id: String(id), contexto });
    setAgindo(false);
    if (!r.ok) {
      setErroAcao(r.erro.campos.contexto ?? r.erro.mensagem);
      return;
    }
    setImpedimento(null);
    mudou();
  }

  if (editando && m) {
    return (
      <EdicaoDadosModal
        voluntario={m}
        onSalvo={() => {
          setEditando(false);
          mudou();
        }}
        onFechar={() => setEditando(false)}
      />
    );
  }

  const falta = m?.validacoes.filter((v) => !v.ok) ?? [];

  return (
    <BrModal show autoClose scrollable size="large" titleText="Detalhes da manifestação" alignFooter="end" onBrModalClose={onFechar}>
      <div className={styles.content}>
        {aviso && <p className={styles.aviso}>{aviso}</p>}
        {carregando && !m && <p role="status">Carregando...</p>}
        {erro && <p className={styles.erro} role="alert">{erro}</p>}

        {m && (
          <>
            <dl className={styles.lista}>
              <div><dt>Pessoa</dt><dd>{m.nome}</dd></div>
              <div><dt>Título de eleitor</dt><dd>{m.titulo_mascarado}</dd></div>
              <div><dt>Nascimento</dt><dd>{m.data_nascimento.split("-").reverse().join("/")}</dd></div>
              <div><dt>Município</dt><dd>{m.municipio}</dd></div>
              <div><dt>Local de votação</dt><dd>{m.local_votacao}</dd></div>
              <div><dt>Zona / seção</dt><dd>{m.zona_eleitoral} / {m.secao_eleitoral}</dd></div>
              <div>
                <dt>Telefone</dt>
                <dd>{m.telefone ? `${m.telefone}${m.telefone_whatsapp ? " (WhatsApp)" : ""}` : "—"}</dd>
              </div>
              <div><dt>E-mail</dt><dd>{m.email || "—"}</dd></div>
              <div><dt>Origem</dt><dd>{ROTULO_ORIGEM[m.origem]}</dd></div>
              <div><dt>Recebida em</dt><dd>{formatarQuando(m.criado_em)}</dd></div>
              <div><dt>Situação</dt><dd><StatusBadge status={SELO_SITUACAO[m.situacao]} /></dd></div>
              <div><dt>Interesse</dt><dd>{m.interesse_ativo ? "Ativo" : "Retirado"}</dd></div>
              {m.alocacao && (
                <div>
                  <dt>Alocação</dt>
                  <dd>
                    {ROTULO_FUNCAO[m.alocacao.funcao]} · seção {m.alocacao.numero_secao} · {m.alocacao.local}
                    {m.alocacao.situacao === "pre_selecionado" ? " (pré-selecionado)" : " (selecionado)"}
                  </dd>
                </div>
              )}
            </dl>

            <h3 className={styles.subtitulo}>Validações</h3>
            <ul className={styles.validacoes} aria-label="Validações">
              {m.validacoes.map((v) => (
                <li key={v.rotulo} className={v.ok ? styles.ok : styles.pendente}>
                  <span aria-hidden="true">{v.ok ? "✓" : "✕"}</span> {v.rotulo}
                  <span className={styles.leitor}>{v.ok ? " (ok)" : " (pendente)"}</span>
                </li>
              ))}
            </ul>

            <h3 className={styles.subtitulo}>Histórico</h3>
            <Historico eventos={m.historico} />

            {impedimento !== null && (
              <div className={styles.campo}>
                <label htmlFor="imp-motivo">Motivo do impedimento</label>
                <textarea
                  id="imp-motivo"
                  rows={3}
                  maxLength={300}
                  value={impedimento}
                  onChange={(e) => setImpedimento(e.target.value)}
                />
              </div>
            )}
          </>
        )}

        {erroAcao && <p className={styles.erro} role="alert">{erroAcao}</p>}
      </div>

      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>
          Fechar
        </BrButton>
        {m && impedimento === null && (
          <>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => setEditando(true)}>
              Editar dados
            </BrButton>
            {m.impedimento_id === null && (
              <BrButton emphasis="secondary" density="small" type="button" onClick={() => setImpedimento("")}>
                Registrar impedimento
              </BrButton>
            )}
          </>
        )}
        {m && impedimento !== null && (
          <>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => setImpedimento(null)}>
              Cancelar
            </BrButton>
            <BrButton emphasis="primary" density="small" type="button" disabled={agindo} onClick={registrarImpedimento}>
              Registrar
            </BrButton>
          </>
        )}
        {m && impedimento === null && m.situacao === "nova" && (
          <BrButton emphasis="primary" density="small" type="button" disabled={agindo} onClick={() => analisar("iniciar")}>
            Iniciar análise
          </BrButton>
        )}
        {m && impedimento === null && m.situacao !== "apta" && (
          <BrButton
            emphasis="primary"
            density="small"
            type="button"
            disabled={agindo || falta.length > 0}
            title={falta.length > 0 ? `Pendente: ${falta.map((f) => f.rotulo).join("; ")}` : undefined}
            onClick={() => analisar("marcar_apta")}
          >
            Marcar como apta
          </BrButton>
        )}
        {m && impedimento === null && m.situacao === "apta" && !m.alocacao && m.interesse_ativo && onEncontrarVaga && (
          <BrButton emphasis="primary" density="small" type="button" onClick={() => onEncontrarVaga(m.id)}>
            Encontrar vaga
          </BrButton>
        )}
      </div>
    </BrModal>
  );
}
