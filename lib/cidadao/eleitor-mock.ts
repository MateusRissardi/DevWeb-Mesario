import type { Contato, Eleitor, SessaoCompleta } from "./sessao";

/*
 * Dados fictícios. Não há integração com o e-Título nem com o cadastro
 * eleitoral: no cadastro, quem preenche os dados pessoais é o próprio cidadão.
 * O mock só existe para "Já sou cadastrado" abrir "Meus dados" enquanto não há
 * banco de dados; ao ter um, substitua `consultarCadastro` por uma consulta real.
 */

const ELEITOR_MOCK: Eleitor = {
  titulo: "123456789012",
  nome: "João da Silva",
  dataNascimento: "02/03/1987",
  nomeMae: "Maria da Silva",
  nomePai: "",
  municipio: "Ibirama/SC",
  zona: "12",
  secao: "0154",
  localVotacao: "Escola Municipal Christa Sedlacek",
};

const CONTATO_MOCK: Contato = {
  telefone: "(00) 00000-0000",
  whatsapp: false,
  email: "joao.silva@gmail.com",
};

/** Cadastro de voluntário já existente, usado por quem clica em "Já sou cadastrado". */
export function consultarCadastro(): SessaoCompleta {
  return {
    eleitor: ELEITOR_MOCK,
    contato: CONTATO_MOCK,
    interesse: { status: "ativo", desde: new Date().toISOString() },
  };
}
