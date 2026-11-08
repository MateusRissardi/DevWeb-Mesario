import { z } from "zod";

function somenteDigitos(tamanho: number, mensagem: string) {
  return z
    .string(mensagem)
    .transform((valor) => valor.replace(/\D/g, ""))
    .pipe(z.string().length(tamanho, mensagem));
}

// Aceita 12 ou "12" (o formulário do cartório envia texto, o do cidadão envia número).
const inteiro = (mensagem: string) =>
  z.union(
    [
      z.number().int(mensagem).nonnegative(mensagem),
      z
        .string()
        .regex(/^\d{1,9}$/, mensagem)
        .transform(Number),
    ],
    mensagem,
  );

const inteiroPositivo = (mensagem: string) =>
  inteiro(mensagem).refine((numero) => numero > 0, mensagem);

const texto = (rotulo: string) =>
  z
    .string(`Informe ${rotulo}`)
    .trim()
    .min(1, `Informe ${rotulo}`)
    .max(200, `${rotulo} deve ter no máximo 200 caracteres`);

const telefone = z
  .string()
  .trim()
  .max(30, "O telefone deve ter no máximo 30 caracteres");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "O e-mail deve ter no máximo 254 caracteres")
  .pipe(z.email("Informe um e-mail válido"));

/** Campo opcional que aceita ausente, null ou texto vazio, tudo virando null. */
function opcional<T extends z.ZodType<string>>(esquema: T) {
  return z
    .union([z.literal(""), z.null(), esquema])
    .transform((valor) => (valor === "" ? null : valor));
}

/** Igual a `opcional`, mas a chave pode faltar na requisição (vira null). */
function opcionalOuAusente<T extends z.ZodType<string>>(esquema: T) {
  return opcional(esquema)
    .optional()
    .transform((valor) => valor ?? null);
}

export const criarMesarioSchema = z.object({
  cpf: somenteDigitos(11, "O CPF deve ter 11 dígitos"),
  titulo_eleitor: somenteDigitos(
    12,
    "O título de eleitor deve ter 12 dígitos",
  ),
  nome_civil: texto("o nome completo"),
  data_nascimento: z.iso.date("Informe a data de nascimento no formato AAAA-MM-DD"),
  nome_mae: texto("o nome da mãe"),
  nome_pai: opcionalOuAusente(texto("o nome do pai")),
  municipio: texto("o município"),
  zona_eleitoral: inteiroPositivo("Informe a zona eleitoral (maior que zero)"),
  secao_eleitoral: inteiroPositivo("Informe a seção eleitoral (maior que zero)"),
  local_votacao: texto("o local de votação"),
  telefone: opcionalOuAusente(telefone),
  email: opcionalOuAusente(email),
});

export const atualizarMesarioSchema = z
  .object({
    telefone: opcional(telefone).optional(),
    email: opcional(email).optional(),
    status_interesse: z.boolean("Informe true ou false").optional(),
  })
  .refine(
    (dados) =>
      dados.telefone !== undefined ||
      dados.email !== undefined ||
      dados.status_interesse !== undefined,
    "Informe ao menos um campo para atualizar",
  );

export const idSchema = z
  .string()
  .regex(/^\d{1,9}$/, "Identificador inválido")
  .transform(Number);

export type CriarMesarioEntrada = z.infer<typeof criarMesarioSchema>;
export type AtualizarMesarioEntrada = z.infer<typeof atualizarMesarioSchema>;
