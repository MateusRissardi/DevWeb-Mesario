import { z } from "zod";

const texto = (rotulo: string, limite: number) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${rotulo}`)
    .max(limite, `${rotulo} deve ter no máximo ${limite} caracteres`);

const bairro = z
  .union([
    z.string().trim().max(100, "Bairro deve ter no máximo 100 caracteres"),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((valor) => (typeof valor === "string" && valor ? valor : null));

const uf = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, "Informe uma UF com duas letras");

const inteiroPositivo = z
  .number()
  .int("Informe um número inteiro")
  .min(1, "O valor deve ser maior que zero")
  .max(2147483647, "O valor excede o limite permitido");

const camposLocal = {
  nome: texto("o nome do local", 150),
  endereco: texto("o endereço", 255),
  bairro,
  cidade: texto("a cidade", 100),
  uf,
  zona_eleitoral: inteiroPositivo,
};

export const criarLocalSchema = z.object(camposLocal);

export const atualizarLocalSchema = z
  .object(camposLocal)
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const criarSecaoSchema = z.object({
  numero_secao: inteiroPositivo,
});

export const atualizarSecaoSchema = criarSecaoSchema;

export const idSchema = z
  .string()
  .regex(/^\d{1,10}$/, "Identificador inválido")
  .transform(Number)
  .pipe(inteiroPositivo);

export type CriarLocalEntrada = z.infer<typeof criarLocalSchema>;
export type AtualizarLocalEntrada = z.infer<typeof atualizarLocalSchema>;
