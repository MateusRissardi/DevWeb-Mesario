"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BrButton } from "@govbr-ds/webcomponents-react";

import { apiFetch, lerErro } from "@/lib/api/client";

import DataTable, { type DataTableColumn } from "./DataTable";
import PageHeader from "./PageHeader";
import styles from "./LocationsSectionsFlow.module.css";

interface SecaoEleitoral {
  id: number;
  numero_secao: number;
  local_id: number;
  criado_em: string | null;
}

interface LocalVotacao {
  id: number;
  nome: string;
  endereco: string;
  bairro: string | null;
  cidade: string;
  uf: string;
  zona_eleitoral: number;
  criado_em: string | null;
  secoes: SecaoEleitoral[];
}

interface FormularioLocal {
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  zona_eleitoral: string;
}

const FORMULARIO_LOCAL_VAZIO: FormularioLocal = {
  nome: "",
  endereco: "",
  bairro: "",
  cidade: "",
  uf: "SC",
  zona_eleitoral: "",
};

function mensagemErro(erro: unknown, padrao: string) {
  return erro instanceof Error ? erro.message : padrao;
}

async function exigirSucesso(resposta: Response, padrao: string) {
  if (!resposta.ok) {
    throw new Error((await lerErro(resposta, padrao)).mensagem);
  }
}

function Campo({
  id,
  label,
  value,
  onChange,
  required = true,
  maxLength,
  type = "text",
  min,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
  type?: "text" | "number";
  min?: number;
}) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        required={required}
        maxLength={maxLength}
        min={min}
        step={type === "number" ? 1 : undefined}
      />
    </label>
  );
}

export default function LocationsSectionsFlow() {
  const [locais, setLocais] = useState<LocalVotacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [localSelecionadoId, setLocalSelecionadoId] = useState<number | null>(
    null,
  );
  const [formularioLocalAberto, setFormularioLocalAberto] = useState(false);
  const [localEmEdicaoId, setLocalEmEdicaoId] = useState<number | null>(null);
  const [formularioLocal, setFormularioLocal] = useState<FormularioLocal>(
    FORMULARIO_LOCAL_VAZIO,
  );
  const [formularioSecaoAberto, setFormularioSecaoAberto] = useState(false);
  const [secaoEmEdicaoId, setSecaoEmEdicaoId] = useState<number | null>(null);
  const [numeroSecao, setNumeroSecao] = useState("");

  async function carregarLocais() {
    const resposta = await apiFetch("/api/locais-secoes");
    await exigirSucesso(resposta, "Não foi possível carregar os locais.");

    const corpo = (await resposta.json()) as { data?: unknown };
    if (!Array.isArray(corpo.data)) {
      throw new Error("O servidor retornou uma lista de locais inválida.");
    }

    setLocais(corpo.data as LocalVotacao[]);
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        await carregarLocais();
        if (ativo) setErro(null);
      } catch (falha) {
        if (ativo) {
          setErro(mensagemErro(falha, "Não foi possível carregar os locais."));
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const localSelecionado = locais.find(
    (local) => local.id === localSelecionadoId,
  );
  const locaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return locais;
    return locais.filter((local) =>
      [
        local.nome,
        local.endereco,
        local.bairro ?? "",
        local.cidade,
        local.uf,
        String(local.zona_eleitoral),
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(termo),
    );
  }, [busca, locais]);

  function abrirNovoLocal() {
    setLocalEmEdicaoId(null);
    setFormularioLocal(FORMULARIO_LOCAL_VAZIO);
    setFormularioLocalAberto(true);
    setErro(null);
    setAviso(null);
  }

  function abrirEdicaoLocal(local: LocalVotacao) {
    setLocalEmEdicaoId(local.id);
    setFormularioLocal({
      nome: local.nome,
      endereco: local.endereco,
      bairro: local.bairro ?? "",
      cidade: local.cidade,
      uf: local.uf,
      zona_eleitoral: String(local.zona_eleitoral),
    });
    setFormularioLocalAberto(true);
    setErro(null);
    setAviso(null);
  }

  function fecharFormularioLocal() {
    setFormularioLocalAberto(false);
    setLocalEmEdicaoId(null);
    setFormularioLocal(FORMULARIO_LOCAL_VAZIO);
  }

  async function salvarLocal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    setErro(null);
    setAviso(null);

    const editando = localEmEdicaoId !== null;
    try {
      const resposta = await apiFetch(
        editando
          ? `/api/locais-secoes/locais/${localEmEdicaoId}`
          : "/api/locais-secoes",
        {
          method: editando ? "PUT" : "POST",
          body: JSON.stringify({
            ...formularioLocal,
            bairro: formularioLocal.bairro.trim() || null,
            uf: formularioLocal.uf.trim().toUpperCase(),
            zona_eleitoral: Number(formularioLocal.zona_eleitoral),
          }),
        },
      );
      await exigirSucesso(resposta, "Não foi possível salvar o local.");
      await carregarLocais();
      fecharFormularioLocal();
      setAviso(editando ? "Local atualizado." : "Local cadastrado.");
    } catch (falha) {
      setErro(mensagemErro(falha, "Não foi possível salvar o local."));
    } finally {
      setSalvando(false);
    }
  }

  async function removerLocal(local: LocalVotacao) {
    const confirmacao = window.confirm(
      `Excluir "${local.nome}"? As ${local.secoes.length} seção(ões) vinculada(s) também serão excluídas.`,
    );
    if (!confirmacao) return;

    setSalvando(true);
    setErro(null);
    setAviso(null);
    try {
      const resposta = await apiFetch(
        `/api/locais-secoes/locais/${local.id}`,
        { method: "DELETE" },
      );
      await exigirSucesso(resposta, "Não foi possível excluir o local.");
      await carregarLocais();
      if (localSelecionadoId === local.id) setLocalSelecionadoId(null);
      setAviso("Local excluído.");
    } catch (falha) {
      setErro(mensagemErro(falha, "Não foi possível excluir o local."));
    } finally {
      setSalvando(false);
    }
  }

  function abrirNovaSecao() {
    setSecaoEmEdicaoId(null);
    setNumeroSecao("");
    setFormularioSecaoAberto(true);
    setErro(null);
    setAviso(null);
  }

  function abrirEdicaoSecao(secao: SecaoEleitoral) {
    setSecaoEmEdicaoId(secao.id);
    setNumeroSecao(String(secao.numero_secao));
    setFormularioSecaoAberto(true);
    setErro(null);
    setAviso(null);
  }

  function fecharFormularioSecao() {
    setFormularioSecaoAberto(false);
    setSecaoEmEdicaoId(null);
    setNumeroSecao("");
  }

  async function salvarSecao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!localSelecionado) return;

    setSalvando(true);
    setErro(null);
    setAviso(null);
    const editando = secaoEmEdicaoId !== null;
    try {
      const resposta = await apiFetch(
        editando
          ? `/api/locais-secoes/${secaoEmEdicaoId}`
          : `/api/locais-secoes/locais/${localSelecionado.id}/secoes`,
        {
          method: editando ? "PUT" : "POST",
          body: JSON.stringify({ numero_secao: Number(numeroSecao) }),
        },
      );
      await exigirSucesso(resposta, "Não foi possível salvar a seção.");
      await carregarLocais();
      fecharFormularioSecao();
      setAviso(editando ? "Seção atualizada." : "Seção cadastrada.");
    } catch (falha) {
      setErro(mensagemErro(falha, "Não foi possível salvar a seção."));
    } finally {
      setSalvando(false);
    }
  }

  async function removerSecao(secao: SecaoEleitoral) {
    if (
      !window.confirm(
        `Excluir a seção ${secao.numero_secao} deste local?`,
      )
    ) {
      return;
    }

    setSalvando(true);
    setErro(null);
    setAviso(null);
    try {
      const resposta = await apiFetch(`/api/locais-secoes/${secao.id}`, {
        method: "DELETE",
      });
      await exigirSucesso(resposta, "Não foi possível excluir a seção.");
      await carregarLocais();
      setAviso("Seção excluída.");
    } catch (falha) {
      setErro(mensagemErro(falha, "Não foi possível excluir a seção."));
    } finally {
      setSalvando(false);
    }
  }

  const colunasLocais: readonly DataTableColumn<LocalVotacao>[] = [
    {
      key: "nome",
      label: "Local de votação",
      columnWidth: "1.5fr",
      render: (local) => (
        <div className={styles.localCell}>
          <strong>{local.nome}</strong>
          <span>{local.endereco}</span>
        </div>
      ),
    },
    {
      key: "cidade",
      label: "Município",
      columnWidth: "1fr",
      render: (local) => `${local.cidade} - ${local.uf}`,
    },
    {
      key: "zona",
      label: "Zona",
      columnWidth: "80px",
      render: (local) => local.zona_eleitoral,
    },
    {
      key: "secoes",
      label: "Seções",
      columnWidth: "80px",
      render: (local) => local.secoes.length,
    },
    {
      key: "acoes",
      label: "Ações",
      columnWidth: "250px",
      render: (local) => (
        <div className={styles.rowActions}>
          <button
            className={styles.textButton}
            type="button"
            disabled={salvando}
            onClick={() => setLocalSelecionadoId(local.id)}
          >
            Gerenciar seções
          </button>
          <button
            className={styles.textButton}
            type="button"
            disabled={salvando}
            onClick={() => abrirEdicaoLocal(local)}
          >
            Editar
          </button>
          <button
            className={styles.dangerButton}
            type="button"
            disabled={salvando}
            onClick={() => void removerLocal(local)}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  const colunasSecoes: readonly DataTableColumn<SecaoEleitoral>[] = [
    {
      key: "numero",
      label: "Número da seção",
      columnWidth: "1fr",
      render: (secao) => secao.numero_secao,
    },
    {
      key: "acoes",
      label: "Ações",
      columnWidth: "180px",
      render: (secao) => (
        <div className={styles.rowActions}>
          <button
            className={styles.textButton}
            type="button"
            disabled={salvando}
            onClick={() => abrirEdicaoSecao(secao)}
          >
            Editar
          </button>
          <button
            className={styles.dangerButton}
            type="button"
            disabled={salvando}
            onClick={() => void removerSecao(secao)}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  const totalSecoes = locais.reduce(
    (total, local) => total + local.secoes.length,
    0,
  );

  return (
    <div className={styles.page}>
      {localSelecionado ? (
        <>
          <PageHeader
            title={localSelecionado.nome}
            description={`${localSelecionado.endereco} · ${localSelecionado.cidade}/${localSelecionado.uf} · ${localSelecionado.zona_eleitoral}ª Zona`}
            action={
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  setLocalSelecionadoId(null);
                  fecharFormularioSecao();
                }}
              >
                Voltar aos locais
              </button>
            }
          />
          <section className={styles.summary} aria-label="Resumo do local">
            <div className={styles.summaryItem}>
              <strong>Seções cadastradas</strong>
              <span>{localSelecionado.secoes.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <strong>Bairro</strong>
              <span>{localSelecionado.bairro || "Não informado"}</span>
            </div>
            <div className={styles.summaryItem}>
              <strong>Município</strong>
              <span>{localSelecionado.cidade}</span>
            </div>
          </section>
          <PageHeader
            title="Seções do local"
            description="Cadastre, edite ou remova as seções eleitorais deste local."
            action={
              <button
                className={styles.primaryButton}
                type="button"
                disabled={salvando}
                onClick={abrirNovaSecao}
              >
                Nova seção
              </button>
            }
          />
          {formularioSecaoAberto && (
            <form className={styles.formPanel} onSubmit={salvarSecao}>
              <h3>
                {secaoEmEdicaoId === null ? "Cadastrar seção" : "Editar seção"}
              </h3>
              <div className={styles.formGrid}>
                <Campo
                  id="numero-secao"
                  label="Número da seção"
                  type="number"
                  min={1}
                  value={numeroSecao}
                  onChange={setNumeroSecao}
                />
              </div>
              <div className={styles.formActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={salvando}
                  onClick={fecharFormularioSecao}
                >
                  Cancelar
                </button>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar seção"}
                </button>
              </div>
            </form>
          )}
          {erro && <p className={styles.error} role="alert">{erro}</p>}
          {aviso && <p className={styles.success} role="status">{aviso}</p>}
          {carregando ? (
            <p className={styles.emptyState} role="status">Carregando seções...</p>
          ) : localSelecionado.secoes.length === 0 ? (
            <p className={styles.emptyState}>
              Nenhuma seção cadastrada para este local.
            </p>
          ) : (
            <DataTable
              title="Seções cadastradas"
              columns={colunasSecoes}
              rows={localSelecionado.secoes}
              getRowKey={(secao) => secao.id}
              density="medium"
              overflow="truncate"
            />
          )}
        </>
      ) : (
        <>
          <PageHeader
            title="Locais e seções"
            description="Consulte e mantenha os locais de votação e suas seções eleitorais."
            action={
              <BrButton
                emphasis="primary"
                type="button"
                onClick={abrirNovoLocal}
              >
                + Novo local
              </BrButton>
            }
          />
          <section className={styles.summary} aria-label="Resumo de locais e seções">
            <div className={styles.summaryItem}>
              <strong>Locais de votação</strong>
              <span>{locais.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <strong>Seções cadastradas</strong>
              <span>{totalSecoes}</span>
            </div>
            <div className={styles.summaryItem}>
              <strong>Municípios</strong>
              <span>{new Set(locais.map((local) => local.cidade)).size}</span>
            </div>
          </section>
          {formularioLocalAberto && (
            <form className={styles.formPanel} onSubmit={salvarLocal}>
              <h3>
                {localEmEdicaoId === null ? "Cadastrar local" : "Editar local"}
              </h3>
              <div className={styles.formGrid}>
                <Campo
                  id="nome-local"
                  label="Nome do local"
                  maxLength={150}
                  value={formularioLocal.nome}
                  onChange={(nome) =>
                    setFormularioLocal((atual) => ({ ...atual, nome }))
                  }
                />
                <Campo
                  id="endereco-local"
                  label="Endereço"
                  maxLength={255}
                  value={formularioLocal.endereco}
                  onChange={(endereco) =>
                    setFormularioLocal((atual) => ({ ...atual, endereco }))
                  }
                />
                <Campo
                  id="bairro-local"
                  label="Bairro"
                  maxLength={100}
                  required={false}
                  value={formularioLocal.bairro}
                  onChange={(bairro) =>
                    setFormularioLocal((atual) => ({ ...atual, bairro }))
                  }
                />
                <Campo
                  id="cidade-local"
                  label="Cidade"
                  maxLength={100}
                  value={formularioLocal.cidade}
                  onChange={(cidade) =>
                    setFormularioLocal((atual) => ({ ...atual, cidade }))
                  }
                />
                <Campo
                  id="uf-local"
                  label="UF"
                  maxLength={2}
                  value={formularioLocal.uf}
                  onChange={(uf) =>
                    setFormularioLocal((atual) => ({ ...atual, uf }))
                  }
                />
                <Campo
                  id="zona-local"
                  label="Zona eleitoral"
                  type="number"
                  min={1}
                  value={formularioLocal.zona_eleitoral}
                  onChange={(zona_eleitoral) =>
                    setFormularioLocal((atual) => ({
                      ...atual,
                      zona_eleitoral,
                    }))
                  }
                />
              </div>
              <div className={styles.formActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={salvando}
                  onClick={fecharFormularioLocal}
                >
                  Cancelar
                </button>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar local"}
                </button>
              </div>
            </form>
          )}
          <label className={styles.searchField} htmlFor="buscar-locais">
            <span>Buscar locais</span>
            <input
              id="buscar-locais"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.currentTarget.value)}
              placeholder="Nome, endereço, município ou zona"
            />
          </label>
          {erro && <p className={styles.error} role="alert">{erro}</p>}
          {aviso && <p className={styles.success} role="status">{aviso}</p>}
          {carregando ? (
            <p className={styles.emptyState} role="status">Carregando locais...</p>
          ) : locaisFiltrados.length === 0 ? (
            <p className={styles.emptyState}>
              {locais.length === 0
                ? "Nenhum local de votação cadastrado."
                : "Nenhum local encontrado para essa busca."}
            </p>
          ) : (
            <DataTable
              title="Locais de votação"
              columns={colunasLocais}
              rows={locaisFiltrados}
              getRowKey={(local) => local.id}
              density="medium"
              overflow="truncate"
            />
          )}
        </>
      )}
    </div>
  );
}
