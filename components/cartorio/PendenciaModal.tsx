"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import {
  enviar,
  formatarQuando,
  useApi,
  type PendenciaDetalhe,
} from "@/lib/api/cartorio";

import Historico from "./Historico";
import { ROTULO_TIPO_PENDENCIA, SELO_PRIORIDADE, SELO_STATUS_PENDENCIA } from "./rotulos";
import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./Modais.module.css";

/** Detalhe de uma pendência, com histórico e as ações "Iniciar análise" e "Marcar como resolvido". */
export default function PendenciaModal({
  id,
  onMudou,
  onFechar,
  onVerVoluntario,
  onVerSecao,
}: Readonly<{
  id: number;
  onMudou: () => void;
  onFechar: () => void;
  onVerVoluntario?: (mesarioId: number) => void;
  onVerSecao?: (secaoId: number) => void;
}>) {
  const { dados: resposta, erro, carregando, recarregar } = useApi<{ data: PendenciaDetalhe }>(`/api/cartorio/pendencias/${id}`);
  const dados = resposta?.data;
  const [agindo, setAgindo] = useState(false);
  const [erroAcao, setErroAcao] = useState("");

  async function agir(acao: "assumir" | "resolver") {
    setAgindo(true);
    setErroAcao("");
    const r = await enviar("PUT", `/api/cartorio/pendencias/${id}`, { acao });
    setAgindo(false);
    if (!r.ok) {
      setErroAcao(r.erro.mensagem);
      return;
    }
    onMudou();
    recarregar();
  }

  const encerrada = dados?.status === "resolvida";
  const statusSelo =
    dados && dados.status !== "resolvida" ? SELO_STATUS_PENDENCIA[dados.status] : undefined;

  return (
    <BrModal show autoClose scrollable size="medium" titleText="Detalhes da pendência" alignFooter="end" onBrModalClose={onFechar}>
      <div className={styles.content}>
        {carregando && !dados && <p>Carregando...</p>}
        {erro && <p className={styles.erro} role="alert">{erro}</p>}

        {dados && (
          <>
            <dl className={styles.lista}>
              <div><dt>Pendência</dt><dd>{ROTULO_TIPO_PENDENCIA[dados.tipo]}</dd></div>
              <div>
                <dt>Prioridade</dt>
                <dd><StatusBadge status={SELO_PRIORIDADE[dados.prioridade]} /></dd>
              </div>
              <div>
                <dt>Situação</dt>
                <dd>
                  {statusSelo ? (
                    <StatusBadge status={statusSelo} />
                  ) : (
                    <StatusBadge status={StatusBadgeType.SemAlerta} label="Resolvida" />
                  )}
                </dd>
              </div>
              {dados.pessoa && <div><dt>Pessoa</dt><dd>{dados.pessoa}</dd></div>}
              {dados.secao && <div><dt>Seção</dt><dd>{dados.secao}</dd></div>}
              <div><dt>Contexto</dt><dd>{dados.contexto}</dd></div>
              <div><dt>Responsável</dt><dd>{dados.responsavel ?? "—"}</dd></div>
              <div><dt>Criada em</dt><dd>{formatarQuando(dados.criada_em)}</dd></div>
            </dl>

            {!dados.manual && !encerrada && (
              <p className={styles.aviso}>
                Esta pendência é encerrada automaticamente quando a situação for corrigida.
              </p>
            )}

            <h3 className={styles.subtitulo}>Histórico</h3>
            <Historico eventos={dados.historico} />
          </>
        )}

        {erroAcao && <p className={styles.erro} role="alert">{erroAcao}</p>}
      </div>

      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>
          Fechar
        </BrButton>
        {dados?.mesario_id != null && onVerVoluntario && (
          <BrButton emphasis="secondary" density="small" type="button" onClick={() => onVerVoluntario(dados.mesario_id!)}>
            Ver manifestação
          </BrButton>
        )}
        {dados?.secao_id != null && onVerSecao && (
          <BrButton emphasis="secondary" density="small" type="button" onClick={() => onVerSecao(dados.secao_id!)}>
            Ver seção
          </BrButton>
        )}
        {dados && !encerrada && dados.status === "aberta" && (
          <BrButton emphasis="primary" density="small" type="button" disabled={agindo} onClick={() => agir("assumir")}>
            Iniciar análise
          </BrButton>
        )}
        {dados && !encerrada && dados.manual && (
          <BrButton emphasis="primary" density="small" type="button" disabled={agindo} onClick={() => agir("resolver")}>
            Marcar como resolvido
          </BrButton>
        )}
      </div>
    </BrModal>
  );
}
