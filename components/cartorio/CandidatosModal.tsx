"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import {
  comParametros,
  enviar,
  ROTULO_FUNCAO,
  useApi,
  type Candidato,
} from "@/lib/api/cartorio";

import { CampoBusca } from "./Controles";
import { ConfirmarPreSelecao, PreSelecaoConcluida, type ResumoPreSelecao } from "./PreSelecao";

import styles from "./Modais.module.css";

type Etapa = { tipo: "busca" } | { tipo: "confirmar"; candidato: Candidato } | { tipo: "pronto"; candidato: Candidato };

/** Escolhe um voluntário para a função: busca, confirmação e resultado. */
export default function CandidatosModal({
  secaoId,
  funcao,
  descricao,
  onAlocado,
  onFechar,
}: Readonly<{
  secaoId: number;
  funcao: string;
  descricao: string;
  onAlocado: () => void;
  onFechar: () => void;
}>) {
  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "busca" });
  const [trabalhando, setTrabalhando] = useState(false);
  const [erro, setErro] = useState("");

  const { dados, erro: erroLista, carregando } = useApi<{ itens: Candidato[]; total: number }>(
    comParametros(`/api/cartorio/secoes/${secaoId}/candidatos`, { q }),
  );

  async function confirmar(candidato: Candidato) {
    setTrabalhando(true);
    setErro("");
    const r = await enviar("POST", "/api/cartorio/alocacoes", {
      mesario_id: candidato.id,
      secao_id: secaoId,
      funcao,
    });
    setTrabalhando(false);
    if (!r.ok) {
      setErro(r.erro.mensagem);
      return;
    }
    setEtapa({ tipo: "pronto", candidato });
  }

  // A mesa só é recarregada ao fechar, para não desmontar este modal antes do resultado.
  function fechar() {
    if (etapa.tipo === "pronto") onAlocado();
    onFechar();
  }

  const rotulo = ROTULO_FUNCAO[funcao];

  const resumoDe = (c: Candidato): ResumoPreSelecao => ({
    nome: c.nome,
    funcao: rotulo,
    onde: descricao,
    votaEm: `${c.local_votacao} (zona ${c.zona_eleitoral}, seção ${c.secao_eleitoral})`,
    compatibilidade: c.motivos.filter((m) => m !== "Sem telefone").join(", ") || "Mesma zona não identificada",
    semTelefone: !c.contato_ok,
  });

  if (etapa.tipo === "pronto") {
    return <PreSelecaoConcluida resumo={resumoDe(etapa.candidato)} onFechar={fechar} />;
  }

  if (etapa.tipo === "confirmar") {
    const c = etapa.candidato;
    return (
      <ConfirmarPreSelecao
        resumo={resumoDe(c)}
        trabalhando={trabalhando}
        erro={erro}
        onVoltar={() => setEtapa({ tipo: "busca" })}
        onConfirmar={() => confirmar(c)}
        onFechar={fechar}
      />
    );
  }

  return (
    <BrModal show autoClose scrollable size="medium" titleText={`Encontrar voluntário: ${rotulo}`} alignFooter="end" onBrModalClose={fechar}>
      <div className={styles.content}>
        <p>{descricao}. Os critérios abaixo só ajudam a organizar a busca; a decisão continua sendo do servidor.</p>
        <CampoBusca placeholder="Buscar por nome, CPF ou título..." valor={q} onBuscar={setQ} />
        {erroLista && <p className={styles.erro} role="alert">{erroLista}</p>}
        {carregando && <p role="status">Carregando...</p>}
        {dados && <h3>{dados.total} {dados.total === 1 ? "voluntário disponível" : "voluntários disponíveis"}</h3>}
        {dados?.itens.length === 0 && <p>Nenhum voluntário disponível com interesse ativo e sem alocação.</p>}
        {dados?.itens.map((c) => (
          <article key={c.id} className={styles.opcao}>
            <div className={styles.opcaoTopo}>
              <strong>{c.nome}</strong>
              <BrButton emphasis="primary" density="small" type="button" aria-label={`Pré-selecionar ${c.nome}`} onClick={() => setEtapa({ tipo: "confirmar", candidato: c })}>
                Pré-selecionar
              </BrButton>
            </div>
            <span>Vota em {c.local_votacao} · zona {c.zona_eleitoral}, seção {c.secao_eleitoral}</span>
            {c.motivos.length > 0 && (
              <div className={styles.etiquetas}>{c.motivos.map((m) => <span key={m}>{m}</span>)}</div>
            )}
          </article>
        ))}
      </div>
      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={fechar}>Fechar</BrButton>
      </div>
    </BrModal>
  );
}
