import { z } from "zod";

export const FUNCOES = [
  "presidente",
  "primeiro_mesario",
  "segundo_mesario",
  "secretario",
  "suplente",
] as const;
export type Funcao = (typeof FUNCOES)[number];

/** Funções que têm uma vaga fixa por seção (suplente não conta). */
export const FUNCOES_DA_MESA = FUNCOES.filter((f) => f !== "suplente");
export const VAGAS_POR_SECAO = FUNCOES_DA_MESA.length;

export const STATUS_CONVOCACAO = [
  "pendente",
  "convocado",
  "confirmado",
  "recusado",
  "cancelado",
] as const;
export type StatusConvocacao = (typeof STATUS_CONVOCACAO)[number];

export const idSchema = z.coerce
  .number("Identificador inválido")
  .int("Identificador inválido")
  .positive("Identificador inválido")
  .max(2_147_483_647, "Identificador inválido");

/** Parâmetros de lista: página, limite e busca (texto até 100 caracteres). */
const textoBusca = z
  .string()
  .trim()
  .max(100, "A busca deve ter no máximo 100 caracteres")
  .optional()
  .transform((v) => (v ? v : undefined));

const paginacao = {
  pagina: z.coerce.number().int().min(1).max(100_000).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  q: textoBusca,
};

function textoObrigatorioBase(rotulo: string, max: number) {
  return z
    .string(`Informe ${rotulo}`)
    .trim()
    .min(1, `Informe ${rotulo}`)
    .max(max, `${rotulo[0].toUpperCase()}${rotulo.slice(1)} deve ter no máximo ${max} caracteres`);
}

const opcional = <T extends z.ZodType>(esquema: T) =>
  esquema.optional().or(z.literal("").transform(() => undefined));

export const listaVoluntariosSchema = z.object({
  ...paginacao,
  situacao: opcional(z.enum(["nova", "apta", "em_analise"])),
  origem: opcional(z.enum(["portal", "presencial"])),
  selecao: opcional(z.enum(["disponivel", "pre_selecionado", "selecionado"])),
  interesse: opcional(z.enum(["ativo", "retirado"])),
});

export const TIPOS_PENDENCIA = [
  "secao_incompleta",
  "possivel_impedimento",
  "falha_contato",
  "interesse_retirado",
  "dados_incompletos",
  "sem_alocacao",
] as const;

export const listaPendenciasSchema = z.object({
  ...paginacao,
  status: opcional(z.enum(["aberta", "em_analise", "resolvida"])),
  prioridade: opcional(z.enum(["critica", "atencao", "informativa"])),
  tipo: opcional(z.enum(TIPOS_PENDENCIA)),
});

export const acaoPendenciaSchema = z.object({
  acao: z.enum(["assumir", "resolver"], "Ação inválida"),
});

export const impedimentoSchema = z.object({
  mesario_id: idSchema,
  contexto: textoObrigatorioBase("o motivo", 300),
});

export const analiseSchema = z.object({
  acao: z.enum(["iniciar", "marcar_apta"], "Ação inválida"),
});

export const confirmarSelecoesSchema = z.object({
  ids: z
    .array(idSchema, "Informe as pré-seleções")
    .min(1, "Selecione ao menos uma pré-seleção")
    .max(200, "Selecione no máximo 200 pré-seleções"),
});

export const listaLocaisSchema = z.object({
  ...paginacao,
  situacao: opcional(z.enum(["completo", "atencao", "critico", "sem_secoes"])),
});

export const listaSecoesSchema = z.object({
  ...paginacao,
  situacao: opcional(z.enum(["completa", "com_vaga"])),
});

export const listaAlocacoesSchema = z.object({
  ...paginacao,
  selecao: opcional(z.enum(["pre_selecionado", "selecionado"])),
  alerta: opcional(z.enum(["com", "sem"])),
});

export const listaConvocacoesSchema = z.object({
  ...paginacao,
  status: opcional(z.enum(STATUS_CONVOCACAO)),
});

export const candidatosSchema = z.object({ q: textoBusca });

const textoObrigatorio = (rotulo: string, max: number) =>
  z
    .string(`Informe ${rotulo}`)
    .trim()
    .min(1, `Informe ${rotulo}`)
    .max(max, `${rotulo[0].toUpperCase()}${rotulo.slice(1)} deve ter no máximo ${max} caracteres`);

export const localSchema = z.object({
  nome: textoObrigatorio("o nome do local", 150),
  endereco: textoObrigatorio("o endereço", 200),
  bairro: z
    .string()
    .trim()
    .max(100, "O bairro deve ter no máximo 100 caracteres")
    .optional()
    .transform((v) => (v ? v : null)),
  cidade: textoObrigatorio("o município", 100),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "A UF deve ter 2 letras")
    .optional()
    .transform((v) => v ?? "SC"),
  zona_eleitoral: z
    .number("Informe a zona eleitoral")
    .int("A zona deve ser um número inteiro")
    .min(1, "A zona deve ser maior que zero")
    .max(9999, "Zona inválida"),
});

export const secaoSchema = z.object({
  numero_secao: z
    .number("Informe o número da seção")
    .int("A seção deve ser um número inteiro")
    .min(1, "A seção deve ser maior que zero")
    .max(9999, "Seção inválida"),
});

export const alocacaoSchema = z.object({
  mesario_id: idSchema,
  secao_id: idSchema,
  funcao: z.enum(FUNCOES, "Função inválida"),
});

export const atualizarConvocacaoSchema = z.object({
  status: z.enum(STATUS_CONVOCACAO, "Situação inválida"),
  observacao: z
    .string()
    .trim()
    .max(500, "A observação deve ter no máximo 500 caracteres")
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const loteConvocacoesSchema = z.object({
  ids: z
    .array(idSchema, "Informe as convocações")
    .min(1, "Selecione ao menos uma convocação")
    .max(200, "Selecione no máximo 200 convocações"),
});

/** Converte os parâmetros de URL em objeto simples para o zod. */
export function paramsDaUrl(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams);
}
