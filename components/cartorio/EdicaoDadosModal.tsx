"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import { enviar, useApi, type LocalLinha, type Pagina, type VoluntarioDetalhe } from "@/lib/api/cartorio";
import SelectField from "./SelectField";
import { TextField } from "@/components/cidadao/Field";
import { dataNascimentoValida, formatarData, formatarTelefone } from "@/lib/cidadao/formatadores";

import styles from "./Modais.module.css";

const paraBr = (iso: string) => iso.split("-").reverse().join("/");
const paraIso = (br: string) => br.split("/").reverse().join("-");

/** "Edição de dados": só o que o cartório pode corrigir. O histórico registra a alteração. */
export default function EdicaoDadosModal({
  voluntario,
  onSalvo,
  onFechar,
}: Readonly<{ voluntario: VoluntarioDetalhe; onSalvo: () => void; onFechar: () => void }>) {
  const [telefone, setTelefone] = useState(voluntario.telefone ?? "");
  const [whatsapp, setWhatsapp] = useState(voluntario.telefone_whatsapp);
  const [email, setEmail] = useState(voluntario.email ?? "");
  const [municipio, setMunicipio] = useState(voluntario.municipio);
  const locais = useApi<Pagina<LocalLinha>>("/api/cartorio/locais?limite=100");
  // Municípios dos locais cadastrados; mantém o valor atual caso não esteja na lista.
  const municipios = Array.from(
    new Set([voluntario.municipio, ...(locais.dados?.itens ?? []).map((l) => l.cidade)].filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const [nascimento, setNascimento] = useState(paraBr(voluntario.data_nascimento));
  const [interesse, setInteresse] = useState(voluntario.interesse_ativo);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const local: Record<string, string> = {};
    if (!municipio.trim()) local.municipio = "Informe o município.";
    if (!dataNascimentoValida(nascimento)) local.data_nascimento = "Informe uma data válida (dd/mm/aaaa).";
    if (Object.keys(local).length > 0) {
      setErros(local);
      return;
    }
    setErros({});
    setErroGeral("");
    setSalvando(true);
    const r = await enviar("PUT", `/api/mesarios/${voluntario.id}`, {
      telefone,
      telefone_whatsapp: whatsapp,
      email,
      municipio: municipio.trim(),
      data_nascimento: paraIso(nascimento),
      status_interesse: interesse,
    });
    setSalvando(false);
    if (!r.ok) {
      setErros(r.erro.campos);
      setErroGeral(Object.keys(r.erro.campos).length > 0 ? "Revise os campos indicados." : r.erro.mensagem);
      return;
    }
    onSalvo();
  }

  return (
    <BrModal show autoClose scrollable size="medium" titleText="Edição de dados" alignFooter="end" onBrModalClose={onFechar}>
      <div className={styles.content}>
        <p className={styles.aviso}>
          Pessoa: <strong>{voluntario.nome}</strong>. Nome, CPF e título de eleitor não podem ser
          alterados aqui. A alteração fica registrada no histórico.
        </p>
        <TextField id="ed-telefone" label="Telefone" inputMode="tel" autoComplete="off" value={telefone} erro={erros.telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} />
        <label className={styles.opcao}>
          <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
          Este telefone tem WhatsApp
        </label>
        <TextField id="ed-email" label="E-mail" type="email" autoComplete="off" value={email} erro={erros.email} onChange={(e) => setEmail(e.target.value)} />
        <SelectField id="ed-municipio" rotulo="Município" valor={municipio} opcoes={municipios.map((m) => ({ valor: m, rotulo: m }))} onChange={setMunicipio} erro={erros.municipio} />
        <TextField id="ed-nasc" label="Data de nascimento" inputMode="numeric" placeholder="dd/mm/aaaa" autoComplete="off" value={nascimento} erro={erros.data_nascimento} onChange={(e) => setNascimento(formatarData(e.target.value))} />
        <label className={styles.opcao}>
          <input type="checkbox" checked={interesse} onChange={(e) => setInteresse(e.target.checked)} />
          Interesse ativo
        </label>
        {erroGeral && <p className={styles.erro} role="alert">{erroGeral}</p>}
      </div>
      <div slot="footer" className={styles.rodape}>
        <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>
          Cancelar
        </BrButton>
        <BrButton emphasis="primary" density="small" type="button" disabled={salvando} onClick={salvar}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </BrButton>
      </div>
    </BrModal>
  );
}
