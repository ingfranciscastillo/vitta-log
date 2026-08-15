import {
	ArrowDownIcon,
	ArrowUpIcon,
	CalendarIcon,
	GraphDownIcon,
	GraphUpIcon,
	RestartIcon,
	ScaleIcon,
} from "@solar-icons/react/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PremiumGate } from "#/components/premium-gate";
import { StatCard } from "#/components/stat-card";
import { currentUserQuery } from "#/lib/profile";
import { weightStatsQuery } from "#/lib/statistics";
import {
	computeStats,
	formatDelta,
	formatWeightValue,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/statistics")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightStatsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: StatisticsPage,
});

function StatisticsPage() {
	const { entries, unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const s = useMemo(() => computeStats(entries), [entries]);

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl">Estadísticas</h1>
				<PremiumGate
					title="Estadísticas avanzadas"
					description="Análisis completo de tu progreso, tendencias y métricas con Premium."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Estadísticas</h1>
			<div className="grid grid-cols-2 gap-3">
				<StatCard
					label="Peso máximo"
					value={
						s.count ? `${formatWeightValue(s.max ?? 0, unit)} ${unit}` : "—"
					}
					icon={ArrowUpIcon}
					accent="text-rose-600"
				/>
				<StatCard
					label="Peso mínimo"
					value={
						s.count ? `${formatWeightValue(s.min ?? 0, unit)} ${unit}` : "—"
					}
					icon={ArrowDownIcon}
					accent="text-emerald-600"
				/>
				<StatCard
					label="Promedio"
					value={
						s.count ? `${formatWeightValue(s.avg ?? 0, unit)} ${unit}` : "—"
					}
					icon={ScaleIcon}
				/>
				<StatCard
					label="Mayor pérdida/día"
					value={s.count ? formatDelta(s.biggestLoss, unit) : "—"}
					icon={GraphDownIcon}
					accent="text-emerald-600"
				/>
				<StatCard
					label="Mayor ganancia/día"
					value={s.count ? formatDelta(s.biggestGain, unit) : "—"}
					icon={GraphUpIcon}
					accent="text-rose-600"
				/>
				<StatCard
					label="Cambio semanal"
					value={
						s.weeklyChange != null ? formatDelta(s.weeklyChange, unit) : "—"
					}
					icon={CalendarIcon}
				/>
				<StatCard
					label="Cambio mensual"
					value={
						s.monthlyChange != null ? formatDelta(s.monthlyChange, unit) : "—"
					}
					icon={CalendarIcon}
				/>
				<StatCard
					label="Total perdido"
					value={
						s.totalLost
							? `${formatWeightValue(s.totalLost, unit)} ${unit}`
							: "—"
					}
					icon={GraphDownIcon}
					accent="text-emerald-600"
				/>
				<StatCard
					label="Total ganado"
					value={
						s.totalGained
							? `${formatWeightValue(s.totalGained, unit)} ${unit}`
							: "—"
					}
					icon={GraphUpIcon}
					accent="text-rose-600"
				/>
				<StatCard
					label="Tendencia"
					value={
						s.trend < -0.001
							? "Descendente"
							: s.trend > 0.001
								? "Ascendente"
								: "Estable"
					}
					icon={RestartIcon}
					accent={
						s.trend < -0.001
							? "text-emerald-600"
							: s.trend > 0.001
								? "text-rose-600"
								: ""
					}
				/>
			</div>
		</div>
	);
}
