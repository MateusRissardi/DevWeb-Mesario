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
  icon: ComponentType<IconProps>;
  badge?: number;
}

export const sidebarNavItems: SidebarNavItem[] = [
  {
    id: "visao-geral",
    label: "Visão geral",
    href: "/cartorio",
    icon: GridIcon,
  },
  {
    id: "pendencias",
    label: "Pendências",
    href: "/cartorio/pendencias",
    icon: AlertIcon,
    badge: 4,
  },
  {
    id: "manifestacoes",
    label: "Manifestações",
    href: "/cartorio/manifestacoes",
    icon: ChatIcon,
  },
  {
    id: "voluntarios",
    label: "Voluntários",
    href: "/cartorio/voluntarios",
    icon: UsersIcon,
  },
  {
    id: "locais-secoes",
    label: "Locais e Seções Eleitorais",
    href: "/cartorio/locais-secoes",
    icon: PinIcon,
  },
  {
    id: "selecao",
    label: "Seleção",
    href: "/cartorio/selecao",
    icon: TargetIcon,
  },
  {
    id: "convocacoes",
    label: "Convocações",
    href: "/cartorio/convocacoes",
    icon: BellIcon,
  },
  {
    id: "treinamentos",
    label: "Treinamentos",
    href: "/cartorio/treinamentos",
    icon: GraduationCapIcon,
  },
  {
    id: "relatorios",
    label: "Relatórios",
    href: "/cartorio/relatorios",
    icon: ReportIcon,
  },
  {
    id: "historico",
    label: "Histórico",
    href: "/cartorio/historico",
    icon: HistoryIcon,
  },
];
