"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import {
  enviar,
  formatarQuando,
  ROTULO_FUNCAO,
  useApi,
  type ConvocacaoLinha,
  type VoluntarioDetalhe,
} from "@/lib/api/cartorio";

import Historico from "./Historico";
import { SELO_CONVOCACAO } from "./rotulos";
import StatusBadge from "./StatusBadge";

import styles from "./Modais.module.css";

const ACOES = [
  { status: "convocado", rotulo: "Convocado" },
  { status: "confirmado", rotulo: "Ciência confirmada" },
  { status: "recusado", rotulo: "Recusou" },
  { status: "cancelado", rotulo: "Cancelada" },
  { status: "pendente", rotulo: "Voltar para pendente" },
] as const;

/** Registro da situação de uma convocação. Nenhuma mensagem é enviada. */
export default function DetalheConvocacaoModal({
  convocacao,
  onSalvo,
  onFechar,
}: Readonly<{
  convocacao: ConvocacaoLinha;
  onSalvo: () => void;
  onFechar: () => void;
}>) {
  const [status, setStatus] = useState<string>(convocacao.status);
  const [observacao, setObservacao] = useState(convocacao.observacao ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const vol = useApi<{ data: VoluntarioDetalhe }>(`/api/cartorio/voluntarios/${convocacao.mesario_id}`);
  const selo = SELO_CONVOCACAO[convocacao.status];
  const falha = !convocacao.contato_ok || convocacao.status === "recusado";
  const semAlocacao = convocacao.alocacao_id === null;
  const opcoes = semAlocacao ? ACOES.filter((a) => a.status === "cancelado") : ACOES;

  async function salvar() {
    setSalvando(true);
    setErro("");
    const r = await enviar("PUT", `/api/cartorio/convocacoes/${convocacao.id}`, {
      status,
      observacao: observacao.trim() || undefined,
    });
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro.campos.observacao ?? r.erro.mensagem);
      return;
    }
    onSalvo();
  }

  return (
    <BrModal
      show
      autoClose
      scrollable
      size="medium"
      titleText="Convocação"
      alignFooter="end"
      onBrModalClose={onFechar}
    >
      <div className={styles.content}>
        <p className={styles.aviso}>
          O envio de mensagens está desativado. Aqui você apenas registra a
          situação da convocação feita por telefone ou outro canal.
        </p>

        <dl className={styles.lista}>
          <div><dt>Pessoa</dt><dd>{convocacao.nome}</dd></div>
          <div>
            <dt>Situação atual</dt>
            <dd><StatusBadge status={selo.tipo} label={selo.rotulo} /></dd>
          </div>
          <div>
            <dt>Local e seção</dt>
            <dd>{convocacao.local ? `${convocacao.local} · seção ${convocacao.numero_secao}` : "—"}</dd>
          </div>
          <div>
            <dt>Função</dt>
            <dd>{convocacao.funcao ? ROTULO_FUNCAO[convocacao.funcao] : "—"}</dd>
          </div>
          <div>
            <dt>Canal</dt>
            <dd>
              {convocacao.telefone
                ? `${convocacao.telefone_whatsapp ? "WhatsApp" : "Telefone"} · ${convocacao.telefone}`
                : "Sem telefone"}
            </dd>
          </div>
          <div><dt>E-mail</dt><dd>{convocacao.email || "—"}</dd></div>
          <div><dt>Atualizada em</dt><dd>{formatarQuando(convocacao.atualizada_em)}</dd></div>
        </dl>

        {falha && (
          <p className={styles.erro} role="alert">
            {convocacao.contato_ok
              ? "Falha de contato: a pessoa recusou. Remova a pré-seleção para liberar a vaga para outro voluntário."
              : "Bloqueio: sem telefone cadastrado. Complete o cadastro em Manifestações (Editar dados) para poder registrar a convocação."}
          </p>
        )}

        {semAlocacao && (
          <p className={styles.erro}>
            A alocação desta convocação foi removida. Ela só pode ficar cancelada.
          </p>
        )}

        <div className={styles.campo}>
          <label htmlFor="conv-status">Nova situação</label>
          <select id="conv-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {opcoes.map((a) => (
              <option key={a.status} value={a.status}>
                {a.rotulo}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="conv-obs">Observação (opcional)</label>
          <textarea
            id="conv-obs"
            rows={3}
            maxLength={500}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}

        <h3 className={styles.subtitulo}>Histórico</h3>
        <Historico eventos={vol.dados?.data.historico ?? []} />
      </div>

      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>
          Fechar
        </BrButton>
        <BrButton emphasis="primary" density="small" type="button" disabled={salvando} onClick={salvar}>
          {salvando ? "Salvando..." : "Salvar situação"}
        </BrButton>
      </div>
    </BrModal>
  );
}
