"use client";

import { useState, type ReactNode } from "react";

import {
  BrButton,
  BrIcon,
  BrInput,
  BrPagination,
} from "@govbr-ds/webcomponents-react";

import styles from "./Controles.module.css";

/** Campo de busca: a busca roda ao apertar Enter ou clicar na lupa. */
export function CampoBusca({
  placeholder,
  valor,
  onBuscar,
}: Readonly<{
  placeholder: string;
  valor: string;
  onBuscar: (texto: string) => void;
}>) {
  const [texto, setTexto] = useState(valor);

  return (
    <BrInput
      className={styles.search}
      type="search"
      density="small"
      highlight
      placeholder={placeholder}
      ariaLabel={placeholder}
      value={texto}
      onInput={(e) => setTexto((e.target as HTMLInputElement).value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onBuscar(texto.trim());
        }
      }}
    >
      <BrButton
        className={styles.searchButton}
        slot="action"
        emphasis="tertiary"
        shape="circle"
        type="button"
        aria-label="Executar busca"
        onClick={() => onBuscar(texto.trim())}
      >
        <BrIcon
          iconName="fa6-solid:magnifying-glass"
          source="auto"
          width="16"
          height="16"
          aria-hidden="true"
        />
      </BrButton>
    </BrInput>
  );
}

export interface OpcaoFiltro {
  valor: string;
  rotulo: string;
}

/** Filtro simples por lista de opções ("" = todos). */
export function FiltroSelect({
  rotulo,
  valor,
  opcoes,
  onChange,
}: Readonly<{
  rotulo: string;
  valor: string;
  opcoes: readonly OpcaoFiltro[];
  onChange: (valor: string) => void;
}>) {
  return (
    <label className={styles.filtro}>
      <span>{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todos</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Paginador({
  pagina,
  limite,
  total,
  rotulo,
  onPagina,
}: Readonly<{
  pagina: number;
  limite: number;
  total: number;
  rotulo: string;
  onPagina: (pagina: number) => void;
}>) {
  const paginas = Math.max(1, Math.ceil(total / limite));
  return (
    <BrPagination
      variant="contextual"
      current={Math.min(pagina, paginas)}
      total={paginas}
      totalItems={total}
      perPage={limite}
      ariaLabel={rotulo}
      onPageChange={(e) => onPagina(e.detail.page)}
    />
  );
}

/** Mensagem de carregando, erro ou lista vazia, mostrada abaixo da tabela. */
export function EstadoLista({
  carregando,
  erro,
  vazio,
  textoVazio,
  onTentarDeNovo,
}: Readonly<{
  carregando: boolean;
  erro?: string;
  vazio: boolean;
  textoVazio: string;
  onTentarDeNovo?: () => void;
}>): ReactNode {
  if (erro) {
    return (
      <p className={styles.erro} role="alert">
        {erro}{" "}
        {onTentarDeNovo && (
          <button type="button" className={styles.link} onClick={onTentarDeNovo}>
            Tentar de novo
          </button>
        )}
      </p>
    );
  }
  if (carregando) {
    return (
      <p className={styles.estado} role="status">
        Carregando...
      </p>
    );
  }
  if (vazio) {
    return <p className={styles.estado}>{textoVazio}</p>;
  }
  return null;
}


export interface DefinicaoFiltro {
  chave: string;
  rotulo: string;
  valor: string;
  opcoes: readonly OpcaoFiltro[];
}

/** Busca + botão "Filtros (N)" que abre o painel com os filtros. */
export function BarraFiltros({
  placeholder,
  busca,
  onBuscar,
  filtros,
  onFiltro,
  onLimpar,
}: Readonly<{
  placeholder: string;
  busca: string;
  onBuscar: (texto: string) => void;
  filtros: readonly DefinicaoFiltro[];
  onFiltro: (chave: string, valor: string) => void;
  onLimpar: () => void;
}>) {
  const [aberto, setAberto] = useState(false);
  const ativos = filtros.filter((f) => f.valor !== "").length + (busca ? 1 : 0);

  return (
    <div className={styles.barra}>
      <CampoBusca key={busca} placeholder={placeholder} valor={busca} onBuscar={onBuscar} />
      {filtros.length > 0 && (
        <div className={styles.filtrosWrap}>
          <BrButton
            emphasis="primary"
            density="small"
            type="button"
            aria-expanded={aberto}
            onClick={() => setAberto((a) => !a)}
          >
            {ativos > 0 ? `Filtros (${ativos})` : "Filtros"}
          </BrButton>
          {aberto && (
            <div className={styles.painel} role="group" aria-label="Filtros">
              {filtros.map((f) => (
                <FiltroSelect
                  key={f.chave}
                  rotulo={f.rotulo}
                  valor={f.valor}
                  opcoes={f.opcoes}
                  onChange={(v) => onFiltro(f.chave, v)}
                />
              ))}
              <div className={styles.painelAcoes}>
                <BrButton emphasis="secondary" density="small" type="button" onClick={onLimpar}>
                  Limpar filtros
                </BrButton>
                <BrButton emphasis="primary" density="small" type="button" onClick={() => setAberto(false)}>
                  Fechar
                </BrButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Etiquetas dos filtros ativos, cada uma com um × para remover. */
export function ChipsFiltros({
  filtros,
  busca,
  onFiltro,
  onBuscar,
}: Readonly<{
  filtros: readonly DefinicaoFiltro[];
  busca: string;
  onFiltro: (chave: string, valor: string) => void;
  onBuscar: (texto: string) => void;
}>): ReactNode {
  const chips = [
    ...(busca
      ? [{ id: "busca", texto: `Busca: ${busca}`, remover: () => onBuscar("") }]
      : []),
    ...filtros
      .filter((f) => f.valor !== "")
      .map((f) => ({
        id: f.chave,
        texto: `${f.rotulo}: ${f.opcoes.find((o) => o.valor === f.valor)?.rotulo ?? f.valor}`,
        remover: () => onFiltro(f.chave, ""),
      })),
  ];
  if (chips.length === 0) return null;

  return (
    <ul className={styles.chips} aria-label="Filtros ativos">
      {chips.map((c) => (
        <li key={c.id}>
          {c.texto}
          <button type="button" aria-label={`Remover filtro ${c.texto}`} onClick={c.remover}>
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}

/** "Exibir 10 ▾ | 1-10 de N itens        Página 1 ▾ ‹ ›" */
export function RodapeLista({
  pagina,
  limite,
  total,
  onPagina,
  onLimite,
  unidade = "itens",
}: Readonly<{
  pagina: number;
  limite: number;
  total: number;
  onPagina: (pagina: number) => void;
  onLimite: (limite: number) => void;
  unidade?: string;
}>) {
  const paginas = Math.max(1, Math.ceil(total / limite));
  const atual = Math.min(pagina, paginas);
  const de = total === 0 ? 0 : (atual - 1) * limite + 1;
  const ate = Math.min(atual * limite, total);

  return (
    <div className={styles.rodape}>
      <label className={styles.rodapeCampo}>
        Exibir
        <select value={limite} onChange={(e) => onLimite(Number(e.target.value))}>
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <span className={styles.rodapeTexto}>
        {de}-{ate} de {total} {unidade}
      </span>
      <span className={styles.rodapeEspaco} />
      <label className={styles.rodapeCampo}>
        Página
        <select value={atual} onChange={(e) => onPagina(Number(e.target.value))}>
          {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className={styles.seta} aria-label="Página anterior" disabled={atual <= 1} onClick={() => onPagina(atual - 1)}>
        ‹
      </button>
      <button type="button" className={styles.seta} aria-label="Próxima página" disabled={atual >= paginas} onClick={() => onPagina(atual + 1)}>
        ›
      </button>
    </div>
  );
}
