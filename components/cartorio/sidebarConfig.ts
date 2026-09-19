import type { ComponentType } from "react";

import {
  AlertIcon,
  BellIcon,
  ChatIcon,
  GraduationCapIcon,
  GridIcon,
  HistoryIcon,
  PinIcon,
  ReportIcon,
  TargetIcon,
  UsersIcon,
} from "./SidebarIcons";
import type { IconProps } from "./SidebarIcons";

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  iconSrc: string;
  badge?: number;
}
export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  iconSrc: string;
  badge?: number;
}

export const sidebarNavItems: SidebarNavItem[] = [
  {
    id: "visao-geral",
    label: "Visão geral",
    href: "/cartorio",
    iconSrc: "/assets/icons/sidebar/overview.svg",
  },
  {
    id: "pendencias",
    label: "Pendências",
    href: "/cartorio/pendencias",
    iconSrc: "/assets/icons/sidebar/pendencias.svg",
    badge: 4,
  },
  {
    id: "manifestacoes",
    label: "Manifestações",
    href: "/cartorio/manifestacoes",
    iconSrc: "/assets/icons/sidebar/manifestacoes.svg",
  },
  {
    id: "voluntarios",
    label: "Voluntários",
    href: "/cartorio/voluntarios",
    iconSrc: "/assets/icons/sidebar/voluntarios.svg",
  },
  {
    id: "locais-secoes",
    label: "Locais e Seções Eleitorais",
    href: "/cartorio/locais-secoes",
    iconSrc: "/assets/icons/sidebar/locais-secoes.svg",
  },
  {
    id: "selecao",
    label: "Seleção",
    href: "/cartorio/selecao",
    iconSrc: "/assets/icons/sidebar/selecao.svg",
  },
  {
    id: "convocacoes",
    label: "Convocações",
    href: "/cartorio/convocacoes",
    iconSrc: "/assets/icons/sidebar/convocacoes.svg",
  },
  {
    id: "treinamentos",
    label: "Treinamentos",
    href: "/cartorio/treinamentos",
    iconSrc: "/assets/icons/sidebar/treinamentos.svg",
  },
  {
    id: "relatorios",
    label: "Relatórios",
    href: "/cartorio/relatorios",
    iconSrc: "/assets/icons/sidebar/relatorios.svg",
  },
  {
    id: "historico",
    label: "Histórico",
    href: "/cartorio/historico",
    iconSrc: "/assets/icons/sidebar/historico.svg",
  },
];
