"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import {
  enviar,
  ROTULO_FUNCAO,
  useApi,
  type VagaCompativel,
  type VoluntarioDetalhe,
} from "@/lib/api/cartorio";

import { ConfirmarPreSelecao, PreSelecaoConcluida, type ResumoPreSelecao } from "./PreSelecao";

import styles from "./Modais.module.css";

type Etapa = { tipo: "lista" } | { tipo: "confirmar"; vaga: VagaCompativel } | { tipo: "pronto"; vaga: VagaCompativel };

const ROTULO_COMPAT = { alta: "Alta", media: "Média" } as const;

/** "Encontrar vaga": parte do voluntário apto e escolhe uma das vagas abertas na zona dele. */
export default function EncontrarVagaModal({
  voluntarioId,
  onAlocado,
  onFechar,
}: Readonly<{ voluntarioId: number; onAlocado: () => void; onFechar: () => void }>) {
  const vol = useApi<{ data: VoluntarioDetalhe }>(`/api/cartorio/voluntarios/${voluntarioId}`);
  const vagas = useApi<{ itens: VagaCompativel[]; total: number }>(`/api/cartorio/voluntarios/${voluntarioId}/vagas`);
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "lista" });
  const [trabalhando, setTrabalhando] = useState(false);
  const [erro, setErro] = useState("");

  const v = vol.dados?.data;

  const resumoDe = (vaga: VagaCompativel): ResumoPreSelecao => ({
    nome: v?.nome ?? "Voluntário",
    funcao: ROTULO_FUNCAO[vaga.funcao],
    onde: `Seção ${vaga.numero_secao} · ${vaga.local}`,
    votaEm: v ? `${v.local_votacao} (zona ${v.zona_eleitoral}, seção ${v.secao_eleitoral})` : undefined,
    interesseAtivo: v?.interesse_ativo,
    compatibilidade: `${ROTULO_COMPAT[vaga.compatibilidade]}${vaga.motivos.length ? ` — ${vaga.motivos.join(", ")}` : ""}`,
    semTelefone: v ? !v.telefone : false,
  });

  async function confirmar(vaga: VagaCompativel) {
    setTrabalhando(true);
    setErro("");
    const r = await enviar("POST", "/api/cartorio/alocacoes", {
      mesario_id: voluntarioId,
      secao_id: vaga.secao_id,
      funcao: vaga.funcao,
    });
    setTrabalhando(false);
    if (!r.ok) {
      setErro(r.erro.mensagem);
      return;
    }
    setEtapa({ tipo: "pronto", vaga });
  }

  function fechar() {
    if (etapa.tipo === "pronto") onAlocado();
    onFechar();
  }

  if (etapa.tipo === "pronto") {
    return <PreSelecaoConcluida resumo={resumoDe(etapa.vaga)} onFechar={fechar} />;
  }
  if (etapa.tipo === "confirmar") {
    const vaga = etapa.vaga;
    return (
      <ConfirmarPreSelecao
        resumo={resumoDe(vaga)}
        trabalhando={trabalhando}
        erro={erro}
        onVoltar={() => {
          setErro("");
          setEtapa({ tipo: "lista" });
        }}
        onConfirmar={() => confirmar(vaga)}
        onFechar={fechar}
      />
    );
  }

  return (
    <BrModal show autoClose scrollable size="medium" titleText="Encontrar vaga" alignFooter="end" onBrModalClose={fechar}>
      <div className={styles.content}>
        {v && <p>Vagas abertas para <strong>{v.nome}</strong>, as mais compatíveis primeiro.</p>}
        {vagas.carregando && <p role="status">Carregando...</p>}
        {vagas.erro && <p className={styles.erro} role="alert">{vagas.erro}</p>}
        {vagas.dados?.itens.length === 0 && <p>Não há vagas abertas na zona deste voluntário.</p>}
        {vagas.dados?.itens.slice(0, 30).map((vaga) => (
          <article key={`${vaga.secao_id}-${vaga.funcao}`} className={styles.opcao}>
            <div className={styles.opcaoTopo}>
              <strong>{ROTULO_FUNCAO[vaga.funcao]} · Seção {vaga.numero_secao}</strong>
              <BrButton
                emphasis="primary"
                density="small"
                type="button"
                aria-label={`Pré-selecionar para ${ROTULO_FUNCAO[vaga.funcao]} da seção ${vaga.numero_secao}`}
                onClick={() => setEtapa({ tipo: "confirmar", vaga })}
              >
                Pré-selecionar
              </BrButton>
            </div>
            <span>{vaga.local}</span>
            <div className={styles.etiquetas}>
              <span>Compatibilidade: {ROTULO_COMPAT[vaga.compatibilidade]}</span>
              {vaga.motivos.map((m) => <span key={m}>{m}</span>)}
            </div>
          </article>
        ))}
      </div>
      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={fechar}>Fechar</BrButton>
      </div>
    </BrModal>
  );
}
