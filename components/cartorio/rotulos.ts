import { StatusBadgeType } from "./StatusBadge";

/** Traduz os valores calculados pela API para os selos (badges) das telas. */
export const SELO_SITUACAO: Record<string, StatusBadgeType> = {
  nova: StatusBadgeType.ManifestacaoNova,
  apta: StatusBadgeType.ManifestacaoApta,
  em_analise: StatusBadgeType.ManifestacaoEmAnalise,
};

export const SELO_SELECAO: Record<string, { tipo: StatusBadgeType; rotulo: string }> = {
  disponivel: { tipo: StatusBadgeType.VoluntarioDisponivel, rotulo: "Disponível" },
  pre_selecionado: { tipo: StatusBadgeType.VoluntarioPreSelecionado, rotulo: "Pré-selecionado" },
  selecionado: { tipo: StatusBadgeType.VoluntarioSelecionada, rotulo: "Selecionado" },
  indisponivel: { tipo: StatusBadgeType.VoluntarioIndisponivel, rotulo: "Interesse retirado" },
};

export const SELO_CONVOCACAO: Record<string, { tipo: StatusBadgeType; rotulo: string }> = {
  pendente: { tipo: StatusBadgeType.ConvocacaoNaoEnviada, rotulo: "Pendente" },
  convocado: { tipo: StatusBadgeType.ConvocacaoConvocada, rotulo: "Convocado" },
  confirmado: { tipo: StatusBadgeType.ConvocacaoCienciaConfirmada, rotulo: "Confirmado" },
  recusado: { tipo: StatusBadgeType.ConvocacaoRecusada, rotulo: "Recusado" },
  cancelado: { tipo: StatusBadgeType.ConvocacaoCancelada, rotulo: "Cancelado" },
};

export const SELO_PRIORIDADE: Record<string, StatusBadgeType> = {
  critica: StatusBadgeType.PrioridadeCritica,
  atencao: StatusBadgeType.PrioridadeAtencao,
  informativa: StatusBadgeType.PrioridadeInformativa,
};

export const SELO_LOCAL: Record<string, { tipo: StatusBadgeType; rotulo?: string }> = {
  completo: { tipo: StatusBadgeType.LocalCompleto },
  atencao: { tipo: StatusBadgeType.LocalAtencao },
  critico: { tipo: StatusBadgeType.LocalCritico },
  sem_secoes: { tipo: StatusBadgeType.SemAlerta, rotulo: "Sem seções" },
};

export const ROTULO_TIPO_PENDENCIA: Record<string, string> = {
  secao_incompleta: "Seção incompleta",
  possivel_impedimento: "Possível impedimento",
  falha_contato: "Falha de contato",
  interesse_retirado: "Interesse retirado",
  dados_incompletos: "Dados incompletos",
  sem_alocacao: "Sem local e seção",
};

export const SELO_STATUS_PENDENCIA: Record<string, StatusBadgeType> = {
  aberta: StatusBadgeType.PendenciaAberta,
  em_analise: StatusBadgeType.PendenciaEmAnalise,
};
