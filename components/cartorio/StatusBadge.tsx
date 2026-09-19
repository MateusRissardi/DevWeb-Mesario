import type { HTMLAttributes } from "react";

import styles from "./StatusBadge.module.css";

export enum StatusBadgeType {
	PrioridadeCritica = 1,
	PrioridadeAtencao = 2,
	PrioridadeInformativa = 3,
	PendenciaAberta = 4,
	PendenciaEmAnalise = 5,
	ManifestacaoNova = 6,
	ManifestacaoApta = 7,
	ManifestacaoEmAnalise = 8,
	VoluntarioDisponivel = 9,
	VoluntarioPreSelecionado = 10,
	VoluntarioSelecionada = 11,
	LocalCompleto = 12,
	LocalAtencao = 13,
	LocalCritico = 14,
}

type StatusBadgeDefinition = {
	label: string;
	color: "red" | "yellow" | "blue" | "gray" | "green";
};

const statusBadgeDefinitions: Record<StatusBadgeType, StatusBadgeDefinition> = {
	[StatusBadgeType.PrioridadeCritica]: { label: "Crítica", color: "red" },
	[StatusBadgeType.PrioridadeAtencao]: { label: "Atenção", color: "yellow" },
	[StatusBadgeType.PrioridadeInformativa]: { label: "Informativa", color: "blue" },
	[StatusBadgeType.PendenciaAberta]: { label: "Aberta", color: "blue" },
	[StatusBadgeType.PendenciaEmAnalise]: { label: "Em análise", color: "yellow" },
	[StatusBadgeType.ManifestacaoNova]: { label: "Nova", color: "gray" },
	[StatusBadgeType.ManifestacaoApta]: { label: "Apta", color: "green" },
	[StatusBadgeType.ManifestacaoEmAnalise]: { label: "Em análise", color: "blue" },
	[StatusBadgeType.VoluntarioDisponivel]: { label: "Disponível", color: "gray" },
	[StatusBadgeType.VoluntarioPreSelecionado]: {
		label: "Pré-selecionado",
		color: "green",
	},
	[StatusBadgeType.VoluntarioSelecionada]: { label: "Selecionada", color: "blue" },
	[StatusBadgeType.LocalCompleto]: { label: "Completo", color: "green" },
	[StatusBadgeType.LocalAtencao]: { label: "Atenção", color: "yellow" },
	[StatusBadgeType.LocalCritico]: { label: "Crítico", color: "red" },
};

export type StatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
	status: StatusBadgeType;
	label?: string;
};

export default function StatusBadge({
	status,
	label,
	className,
	...props
}: StatusBadgeProps) {
	const definition = statusBadgeDefinitions[status];
	const badgeClassName = [styles.badge, styles[definition.color], className]
		.filter(Boolean)
		.join(" ");

	return (
		<span className={badgeClassName} {...props}>
			{label ?? definition.label}
		</span>
	);
}