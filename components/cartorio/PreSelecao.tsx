"use client";

import { useRouter } from "next/navigation";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import StatusBadge, { StatusBadgeType } from "./StatusBadge";

import styles from "./Modais.module.css";

export interface ResumoPreSelecao {
  nome: string;
  funcao: string;
  onde: string;
  votaEm?: string;
  interesseAtivo?: boolean;
  compatibilidade?: string;
  semTelefone?: boolean;
}

/** Passo "Confirmar pré-seleção", igual para quem parte da vaga e para quem parte do voluntário. */
export function ConfirmarPreSelecao({
  resumo,
  trabalhando,
  erro,
  onVoltar,
  onConfirmar,
  onFechar,
}: Readonly<{
  resumo: ResumoPreSelecao;
  trabalhando: boolean;
  erro: string;
  onVoltar: () => void;
  onConfirmar: () => void;
  onFechar: () => void;
}>) {
  return (
    <BrModal show autoClose size="medium" titleText="Confirmar pré-seleção" alignFooter="end" onBrModalClose={onFechar}>
      <div className={styles.content}>
        <div className={styles.opcao}>
          <div className={styles.opcaoTopo}>
            <strong>{resumo.nome}</strong>
            {resumo.interesseAtivo !== false && (
              <StatusBadge status={StatusBadgeType.VoluntarioDisponivel} label="Interesse ativo" />
            )}
          </div>
          <span>{resumo.funcao} · {resumo.onde}</span>
          {resumo.votaEm && <span>Vota em: {resumo.votaEm}</span>}
          {resumo.compatibilidade && <span>Compatibilidade: {resumo.compatibilidade}</span>}
        </div>
        {resumo.semTelefone && (
          <p className={styles.aviso}>
            Este voluntário está sem telefone: a convocação ficará bloqueada até o cadastro ser completado.
          </p>
        )}
        <p>A pré-seleção reserva a vaga e abre uma convocação pendente. Nenhuma mensagem é enviada.</p>
        {erro && <p className={styles.erro} role="alert">{erro}</p>}
      </div>
      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onVoltar}>Voltar</BrButton>
        <BrButton emphasis="primary" density="small" type="button" disabled={trabalhando} onClick={onConfirmar}>
          {trabalhando ? "Aguarde..." : "Confirmar pré-seleção"}
        </BrButton>
      </div>
    </BrModal>
  );
}

/** Resultado: "foi pré-selecionada", com atalho para a tela de Seleção. */
export function PreSelecaoConcluida({
  resumo,
  onFechar,
}: Readonly<{ resumo: ResumoPreSelecao; onFechar: () => void }>) {
  const router = useRouter();
  return (
    <BrModal show autoClose size="medium" titleText="Pré-seleção concluída" alignFooter="end" onBrModalClose={onFechar}>
      <div className={styles.content}>
        <p><strong>{resumo.nome}</strong> foi pré-selecionado(a).</p>
        <p>{resumo.funcao} · {resumo.onde}</p>
        <p className={styles.aviso}>
          A vaga foi reservada e a convocação ficou como pendente. A seleção só vale depois de confirmada
          na tela Seleção. Nenhuma mensagem foi enviada.
        </p>
      </div>
      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>Fechar</BrButton>
        <BrButton emphasis="primary" density="small" type="button" onClick={() => router.push("/cartorio/selecao")}>
          Ver pré-seleção
        </BrButton>
      </div>
    </BrModal>
  );
}
