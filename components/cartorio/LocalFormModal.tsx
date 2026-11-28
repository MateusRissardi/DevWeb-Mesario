"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import { enviar, type LocalLinha } from "@/lib/api/cartorio";
import { UFS } from "@/lib/ufs";

import styles from "./Modais.module.css";

type Campo = "nome" | "endereco" | "bairro" | "cidade" | "uf" | "zona_eleitoral";

/** Cadastro e edição de local de votação. A validação final é do servidor. */
export default function LocalFormModal({
  local,
  onSalvo,
  onFechar,
}: Readonly<{
  local?: LocalLinha;
  onSalvo: () => void;
  onFechar: () => void;
}>) {
  const [valores, setValores] = useState({
    nome: local?.nome ?? "",
    endereco: local?.endereco ?? "",
    bairro: local?.bairro ?? "",
    cidade: local?.cidade ?? "",
    uf: local?.uf ?? "SC",
    zona_eleitoral: local ? String(local.zona_eleitoral) : "",
  });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  const mudar = (campo: Campo) => (e: { target: { value: string } }) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  async function salvar() {
    setErros({});
    setErroGeral("");

    const zona = valores.zona_eleitoral.trim();
    if (!/^\d+$/.test(zona)) {
      setErros({ zona_eleitoral: "Informe a zona eleitoral (só números)." });
      return;
    }

    setSalvando(true);
    const corpo = {
      nome: valores.nome,
      endereco: valores.endereco,
      bairro: valores.bairro.trim() || undefined,
      cidade: valores.cidade,
      uf: valores.uf,
      zona_eleitoral: Number(zona),
    };
    const r = local
      ? await enviar("PUT", `/api/locais-secoes/locais/${local.id}`, corpo)
      : await enviar("POST", "/api/locais-secoes", corpo);
    setSalvando(false);

    if (!r.ok) {
      setErros(r.erro.campos);
      setErroGeral(
        Object.keys(r.erro.campos).length > 0 ? "Revise os campos indicados." : r.erro.mensagem,
      );
      return;
    }
    onSalvo();
  }

  const campo = (id: Campo, rotulo: string, extra: Record<string, string> = {}) => (
    <div className={styles.campo}>
      <label htmlFor={`local-${id}`}>{rotulo}</label>
      <input id={`local-${id}`} value={valores[id]} onChange={mudar(id)} {...extra} />
      {erros[id] && (
        <span className={styles.campoErro} role="alert">
          {erros[id]}
        </span>
      )}
    </div>
  );

  return (
    <BrModal
      show
      autoClose
      scrollable
      size="medium"
      titleText={local ? "Editar local de votação" : "Novo local de votação"}
      alignFooter="end"
      onBrModalClose={onFechar}
    >
      <div className={styles.content}>
        {campo("nome", "Nome do local", { maxLength: "150" })}
        {campo("endereco", "Endereço", { maxLength: "200" })}
        <div className={styles.grade}>
          {campo("bairro", "Bairro (opcional)", { maxLength: "100" })}
          {campo("cidade", "Município", { maxLength: "100" })}
          <div className={styles.campo}>
            <label htmlFor="local-uf">UF</label>
            <select id="local-uf" value={valores.uf} onChange={mudar("uf")}>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {erros.uf && (
              <span className={styles.campoErro} role="alert">
                {erros.uf}
              </span>
            )}
          </div>
          {campo("zona_eleitoral", "Zona eleitoral", { inputMode: "numeric" })}
        </div>
        {erroGeral && (
          <p className={styles.erro} role="alert">
            {erroGeral}
          </p>
        )}
      </div>
      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>
          Cancelar
        </BrButton>
        <BrButton emphasis="primary" density="small" type="button" disabled={salvando} onClick={salvar}>
          {salvando ? "Salvando..." : "Salvar"}
        </BrButton>
      </div>
    </BrModal>
  );
}
