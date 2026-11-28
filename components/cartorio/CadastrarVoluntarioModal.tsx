"use client";

import { useState } from "react";

import { BrButton, BrModal } from "@govbr-ds/webcomponents-react";

import { buscar, enviar, formatarQuando, useApi, type LocalLinha, type Pagina, type SecaoLinha, type VoluntarioLinha } from "@/lib/api/cartorio";
import SelectField from "./SelectField";
import { TextField } from "@/components/cidadao/Field";
import {
  dataNascimentoValida,
  formatarData,
  formatarIdentificador,
  formatarNumeroEleitoral,
  formatarTelefone,
  formatarTitulo,
  somenteDigitos,
} from "@/lib/cidadao/formatadores";

import styles from "./Modais.module.css";

const VAZIO = {
  cpf: "",
  titulo_eleitor: "",
  nome_civil: "",
  data_nascimento: "",
  nome_mae: "",
  nome_pai: "",
  municipio: "",
  zona_eleitoral: "",
  secao_eleitoral: "",
  local_votacao: "",
  telefone: "",
  email: "",
};
type Campo = keyof typeof VAZIO;

const OBRIGATORIOS: readonly [Campo, string][] = [
  ["cpf", "Informe o CPF."],
  ["titulo_eleitor", "Informe o título de eleitor."],
  ["nome_civil", "Informe o nome completo."],
  ["data_nascimento", "Informe a data de nascimento (dd/mm/aaaa)."],
  ["nome_mae", "Informe o nome da mãe."],
  ["municipio", "Informe o município."],
  ["zona_eleitoral", "Informe a zona eleitoral."],
  ["secao_eleitoral", "Informe a seção eleitoral."],
  ["local_votacao", "Informe o local de votação."],
];

const paraIso = (br: string) => br.split("/").reverse().join("-");

type Etapa =
  | { nome: "localizar" }
  | { nome: "dados" }
  | { nome: "pronto"; id: number; nome_civil: string; quando: string };

/**
 * "Cadastrar voluntário" (atendimento presencial): primeiro localiza o eleitor
 * entre as manifestações existentes, para não duplicar; depois registra os dados
 * e as duas validações feitas pelo cartório; no fim mostra o comprovante.
 */
export default function CadastrarVoluntarioModal({
  onConcluido,
  onFechar,
}: Readonly<{ onConcluido: () => void; onFechar: () => void }>) {
  const [etapa, setEtapa] = useState<Etapa>({ nome: "localizar" });
  const [busca, setBusca] = useState("");
  const [existente, setExistente] = useState<VoluntarioLinha | null>(null);
  const [avisoBusca, setAvisoBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  const [v, setV] = useState(VAZIO);
  const [erros, setErros] = useState<Partial<Record<Campo | "validacoes", string>>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [conferiuDocumento, setConferiuDocumento] = useState(false);
  const [confirmouInteresse, setConfirmouInteresse] = useState(false);
  const [localId, setLocalId] = useState("");

  const locais = useApi<Pagina<LocalLinha>>(etapa.nome === "dados" ? "/api/cartorio/locais?limite=100" : null);
  const secoes = useApi<Pagina<SecaoLinha>>(
    etapa.nome === "dados" && localId ? `/api/cartorio/locais/${localId}/secoes?limite=100` : null,
  );

  function escolherLocal(id: string) {
    setLocalId(id);
    const l = locais.dados?.itens.find((x) => String(x.id) === id);
    setV((x) => ({
      ...x,
      local_votacao: l?.nome ?? "",
      municipio: l?.cidade ?? "",
      zona_eleitoral: l ? String(l.zona_eleitoral) : "",
      secao_eleitoral: "",
    }));
  }

  const mudar = (campo: Campo, formatar: (t: string) => string = (t) => t) => ({
    value: v[campo],
    onChange: (e: { target: { value: string } }) => setV((x) => ({ ...x, [campo]: formatar(e.target.value) })),
    erro: erros[campo],
  });

  async function localizar() {
    const digitos = somenteDigitos(busca);
    setExistente(null);
    setAvisoBusca("");
    if (digitos.length !== 11 && digitos.length !== 12) {
      setAvisoBusca("Informe o CPF (11 dígitos) ou o título de eleitor (12 dígitos).");
      return;
    }
    setBuscando(true);
    const r = await buscar<Pagina<VoluntarioLinha>>(`/api/cartorio/voluntarios?q=${digitos}&limite=1`);
    setBuscando(false);
    if (!r.ok) {
      setAvisoBusca(r.erro.mensagem);
      return;
    }
    if (r.dados.itens.length > 0) {
      setExistente(r.dados.itens[0]);
      return;
    }
    setV((x) => ({
      ...x,
      cpf: digitos.length === 11 ? formatarIdentificador(digitos) : x.cpf,
      titulo_eleitor: digitos.length === 12 ? formatarTitulo(digitos) : x.titulo_eleitor,
    }));
    setEtapa({ nome: "dados" });
  }

  async function cadastrar() {
    const local: Partial<Record<Campo | "validacoes", string>> = {};
    for (const [campo, mensagem] of OBRIGATORIOS) {
      if (!v[campo].trim()) local[campo] = mensagem;
    }
    if (somenteDigitos(v.cpf).length > 0 && somenteDigitos(v.cpf).length !== 11) local.cpf = "O CPF deve ter 11 dígitos.";
    if (somenteDigitos(v.titulo_eleitor).length > 0 && somenteDigitos(v.titulo_eleitor).length !== 12) {
      local.titulo_eleitor = "O título de eleitor deve ter 12 dígitos.";
    }
    if (v.data_nascimento && !dataNascimentoValida(v.data_nascimento)) {
      local.data_nascimento = "Informe uma data válida (dd/mm/aaaa).";
    }
    if (!conferiuDocumento || !confirmouInteresse) {
      local.validacoes = "Marque as duas confirmações para cadastrar.";
    }
    if (Object.keys(local).length > 0) {
      setErros(local);
      return;
    }
    setErros({});
    setErroGeral("");
    setSalvando(true);

    const r = await enviar<{ data: { id: number; nome_civil: string; criado_em?: string } }>("POST", "/api/mesarios", {
      cpf: somenteDigitos(v.cpf),
      titulo_eleitor: somenteDigitos(v.titulo_eleitor),
      nome_civil: v.nome_civil,
      data_nascimento: paraIso(v.data_nascimento),
      nome_mae: v.nome_mae,
      nome_pai: v.nome_pai,
      municipio: v.municipio,
      zona_eleitoral: v.zona_eleitoral,
      secao_eleitoral: v.secao_eleitoral,
      local_votacao: v.local_votacao,
      telefone: v.telefone,
      email: v.email,
    });
    setSalvando(false);

    if (!r.ok) {
      setErros(r.erro.campos as Partial<Record<Campo, string>>);
      setErroGeral(Object.keys(r.erro.campos).length > 0 ? "Revise os campos indicados." : r.erro.mensagem);
      return;
    }
    setEtapa({
      nome: "pronto",
      id: r.dados.data.id,
      nome_civil: r.dados.data.nome_civil,
      quando: r.dados.data.criado_em ?? new Date().toISOString(),
    });
    onConcluido();
  }

  const pronto = etapa.nome === "pronto";

  return (
    <BrModal
      show
      autoClose
      scrollable
      size="medium"
      titleText={pronto ? "Comprovante de manifestação" : "Cadastrar voluntário"}
      alignFooter="end"
      onBrModalClose={onFechar}
    >
      <div className={styles.content}>
        {etapa.nome === "localizar" && (
          <>
            <p>Localize o eleitor pelo CPF ou pelo título de eleitor para evitar cadastro duplicado.</p>
            <TextField
              id="loc-busca"
              label="CPF ou título de eleitor"
              inputMode="numeric"
              autoComplete="off"
              value={busca}
              onChange={(e) => setBusca(e.target.value.replace(/[^\d.\- ]/g, ""))}
              erro={avisoBusca}
            />
            {existente && (
              <p className={styles.aviso} role="status">
                Já existe uma manifestação para <strong>{existente.nome}</strong>, recebida em{" "}
                {formatarQuando(existente.criado_em)}. Abra-a na lista de manifestações em vez de cadastrar de novo.
              </p>
            )}
          </>
        )}

        {etapa.nome === "dados" && (
          <>
            <TextField id="nv-cpf" label="CPF" obrigatorio inputMode="numeric" autoComplete="off" {...mudar("cpf", formatarIdentificador)} />
            <TextField id="nv-titulo" label="Título de eleitor" obrigatorio inputMode="numeric" autoComplete="off" {...mudar("titulo_eleitor", formatarTitulo)} />
            <TextField id="nv-nome" label="Nome completo" obrigatorio autoComplete="off" {...mudar("nome_civil")} />
            <TextField id="nv-nascimento" label="Data de nascimento" obrigatorio inputMode="numeric" placeholder="dd/mm/aaaa" autoComplete="off" {...mudar("data_nascimento", formatarData)} />
            <TextField id="nv-mae" label="Nome da mãe" obrigatorio autoComplete="off" {...mudar("nome_mae")} />
            <TextField id="nv-pai" label="Nome do pai (opcional)" autoComplete="off" {...mudar("nome_pai")} />
            <SelectField
              id="nv-local"
              rotulo="Local de votação *"
              valor={localId}
              opcoes={(locais.dados?.itens ?? []).map((l) => ({ valor: String(l.id), rotulo: `${l.nome} — zona ${l.zona_eleitoral}` }))}
              onChange={escolherLocal}
              erro={erros.local_votacao ?? locais.erro}
              placeholder={locais.carregando ? "Carregando…" : "Selecione o local"}
            />
            <TextField id="nv-municipio" label="Município" autoComplete="off" value={v.municipio} onChange={() => {}} readOnly />
            <TextField id="nv-zona" label="Zona eleitoral" autoComplete="off" value={v.zona_eleitoral} onChange={() => {}} readOnly />
            <SelectField
              id="nv-secao"
              rotulo="Seção eleitoral *"
              valor={v.secao_eleitoral}
              opcoes={(secoes.dados?.itens ?? []).map((x) => ({ valor: String(x.numero_secao), rotulo: `Seção ${x.numero_secao}` }))}
              onChange={(valor) => setV((x) => ({ ...x, secao_eleitoral: valor }))}
              erro={erros.secao_eleitoral}
              desabilitado={!localId}
              placeholder={localId ? "Selecione a seção" : "Escolha o local primeiro"}
            />
            <TextField id="nv-telefone" label="Telefone (opcional)" inputMode="tel" autoComplete="off" {...mudar("telefone", formatarTelefone)} />
            <TextField id="nv-email" label="E-mail (opcional)" type="email" autoComplete="off" {...mudar("email")} />

            <fieldset className={styles.campo}>
              <legend>Validações do atendimento</legend>
              <label className={styles.opcao}>
                <input type="checkbox" checked={conferiuDocumento} onChange={(e) => setConferiuDocumento(e.target.checked)} />
                Conferi o documento com foto do eleitor
              </label>
              <label className={styles.opcao}>
                <input type="checkbox" checked={confirmouInteresse} onChange={(e) => setConfirmouInteresse(e.target.checked)} />
                O eleitor confirmou o interesse em ser mesário
              </label>
              {erros.validacoes && <p className={styles.erro} role="alert">{erros.validacoes}</p>}
            </fieldset>

            {erroGeral && <p className={styles.erro} role="alert">{erroGeral}</p>}
          </>
        )}

        {etapa.nome === "pronto" && (
          <div className="comprovante" id="comprovante-manifestacao">
            <p role="status">Manifestação registrada com sucesso.</p>
            <dl className={styles.lista}>
              <div><dt>Protocolo</dt><dd>{String(etapa.id).padStart(6, "0")}</dd></div>
              <div><dt>Pessoa</dt><dd>{etapa.nome_civil}</dd></div>
              <div><dt>Origem</dt><dd>Presencial</dd></div>
              <div><dt>Registrada em</dt><dd>{formatarQuando(etapa.quando)}</dd></div>
            </dl>
          </div>
        )}
      </div>

      <div slot="footer" className={styles.rodape}>
        {etapa.nome === "localizar" && (
          <>
            <BrButton emphasis="secondary" density="small" type="button" onClick={onFechar}>
              Cancelar
            </BrButton>
            <BrButton emphasis="primary" density="small" type="button" disabled={buscando} onClick={localizar}>
              {buscando ? "Localizando..." : "Localizar eleitor"}
            </BrButton>
          </>
        )}
        {etapa.nome === "dados" && (
          <>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => setEtapa({ nome: "localizar" })}>
              Voltar
            </BrButton>
            <BrButton emphasis="primary" density="small" type="button" disabled={salvando} onClick={cadastrar}>
              {salvando ? "Salvando..." : "Cadastrar voluntário"}
            </BrButton>
          </>
        )}
        {etapa.nome === "pronto" && (
          <>
            <BrButton emphasis="secondary" density="small" type="button" onClick={() => window.print()}>
              Imprimir comprovante
            </BrButton>
            <BrButton emphasis="primary" density="small" type="button" onClick={onFechar}>
              Fechar
            </BrButton>
          </>
        )}
      </div>
    </BrModal>
  );
}
