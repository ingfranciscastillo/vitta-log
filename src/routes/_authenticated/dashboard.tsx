import {
	CalendarIcon,
	ChartSquareIcon,
	GraphDownIcon,
	GraphUpIcon,
	MagicWandIcon,
	MedalRibbonIcon,
	MinusCircleIcon,
	PulseIcon,
	ScaleIcon,
	TargetIcon,
} from "@solar-icons/react/bold";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { GoalCard } from "#/components/goal-card";
import { InsightsList } from "#/components/insights-list";
import { StatCard } from "#/components/stat-card";
import { StreakCard } from "#/components/streak-card";
import { WeightChart } from "#/components/weight-chart";
import { currentGoalQuery } from "#/lib/goals";
import { currentUserQuery } from "#/lib/profile";
import { weightStatsQuery } from "#/lib/statistics";
import { weightEntriesQuery } from "#/lib/weight";
import {
	calcIMC,
	computeInsights,
	computeStats,
	computeStreaks,
	formatDelta,
	formatWeightValue,
	imcCategory,
	sortByDateAsc,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightStatsQuery());
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentGoalQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: DashboardPage,
});

function DashboardPage() {
	const navigate = useNavigate();
	const { entries, unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const { goal } = useSuspenseQuery(currentGoalQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;

	const isPremium = !!me?.isPro;
	const heightCm = me?.height != null ? Number(me.height) : null;

	const stats = useMemo(() => computeStats(entries), [entries]);
	const insights = useMemo(
		() => computeInsights(entries, goal, unit),
		[entries, goal, unit],
	);
	const streaks = useMemo(() => computeStreaks(entries), [entries]);
	const imc = heightCm ? calcIMC(stats.current ?? 0, heightCm) : null;
	const imcCat = imcCategory(imc);
	const last30 = useMemo(() => sortByDateAsc(entries).slice(-30), [entries]);

	const delta = stats.changeVsLast;
	const DeltaIcon =
		delta < 0 ? GraphDownIcon : delta > 0 ? GraphUpIcon : MinusCircleIcon;

	const goToGoals = () => {
		void navigate({ to: "/goals" });
	};

	return (
		<div className="space-y-4">
			<div className="rounded-3xl bg-primary text-primary-foreground p-6">
				<div className="text-[11px] uppercase tracking-wider opacity-70">
					Peso actual
				</div>
				<div className="flex items-baseline gap-2 mt-1">
					<span className="font-display text-5xl leading-none">
						{stats.current != null
							? formatWeightValue(stats.current, unit)
							: "—"}
					</span>
					<span className="font-display text-lg opacity-70">{unit}</span>
				</div>
				{entries.length > 1 && (
					<div className="flex items-center gap-1.5 mt-3 text-sm opacity-90">
						<DeltaIcon className="w-4 h-4" />
						<span>{formatDelta(delta, unit)} vs último registro</span>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<StatCard
					label="Desde el inicio"
					value={
						entries.length > 1 ? formatDelta(stats.changeSinceStart, unit) : "—"
					}
					sub="cambio total"
					icon={PulseIcon}
					accent={
						stats.changeSinceStart < 0
							? "text-emerald-600"
							: stats.changeSinceStart > 0
								? "text-rose-600"
								: ""
					}
				/>
				<StatCard
					label="Días registrando"
					value={stats.days}
					sub={`${stats.count} registros`}
					icon={CalendarIcon}
				/>
				<StatCard
					label="Media 7 días"
					value={
						stats.avg7 != null
							? `${formatWeightValue(stats.avg7, unit)} ${unit}`
							: "—"
					}
					icon={ScaleIcon}
				/>
				<StatCard
					label="Media 30 días"
					value={
						stats.avg30 != null
							? `${formatWeightValue(stats.avg30, unit)} ${unit}`
							: "—"
					}
					icon={ScaleIcon}
				/>
			</div>

			{imc != null && (
				<StatCard
					label="IMC"
					value={imc.toFixed(1)}
					sub={imcCat?.label}
					icon={PulseIcon}
					accent={
						imcCat?.tone === "green"
							? "text-emerald-600"
							: imcCat?.tone === "amber"
								? "text-amber-600"
								: imcCat?.tone === "red"
									? "text-rose-600"
									: "text-primary"
					}
				/>
			)}

			{entries.length > 0 && (
				<div className="rounded-2xl bg-card border border-border p-4">
					<div className="flex items-center justify-between mb-2">
						<span className="font-display text-sm">Últimos 30 días</span>
						<Link to="/charts" className="text-xs text-primary">
							Ver más
						</Link>
					</div>
					<WeightChart
						entries={last30}
						goal={goal}
						unit={unit}
						showTrend={false}
						showGoal={false}
					/>
				</div>
			)}

			{goal ? (
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="font-display text-sm">Objetivo</span>
						<Link to="/goals" className="text-xs text-primary">
							Gestionar
						</Link>
					</div>
					<GoalCard
						goal={goal}
						current={stats.current ?? 0}
						unit={unit}
						onEdit={goToGoals}
					/>
				</div>
			) : (
				<Link
					to="/goals"
					className="block rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground hover:bg-muted transition-colors"
				>
					<TargetIcon className="w-5 h-5 mx-auto mb-1 text-primary" />
					Define tu objetivo
				</Link>
			)}

			<div>
				<div className="flex items-center justify-between mb-2">
					<span className="font-display text-sm">Rachas</span>
					<Link to="/achievements" className="text-xs text-primary">
						Logros
					</Link>
				</div>
				<StreakCard current={streaks.current} best={streaks.best} />
			</div>

			{insights.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<ChartSquareIcon className="w-4 h-4 text-primary" />
						<span className="font-display text-sm">Insights</span>
					</div>
					<InsightsList insights={insights} />
				</div>
			)}

			{!isPremium && (
				<div className="rounded-2xl bg-accent/20 border border-accent/40 p-4">
					<div className="flex items-center gap-2 mb-1">
						<MagicWandIcon className="w-4 h-4 text-accent-foreground" />
						<span className="font-display text-sm">Desbloquea Premium</span>
					</div>
					<p className="text-xs text-muted-foreground">
						Historial ilimitado, estadísticas avanzadas y exportación por
						$12.99.
					</p>
				</div>
			)}

			<div className="grid grid-cols-2 gap-3 pt-1">
				<Link
					to="/statistics"
					className="rounded-2xl border border-border p-4 text-center hover:bg-muted transition-colors"
				>
					<ChartSquareIcon className="w-5 h-5 mx-auto text-primary mb-1" />
					<span className="text-sm">Estadísticas</span>
				</Link>
				<Link
					to="/achievements"
					className="rounded-2xl border border-border p-4 text-center hover:bg-muted transition-colors"
				>
					<MedalRibbonIcon className="w-5 h-5 mx-auto text-primary mb-1" />
					<span className="text-sm">Logros</span>
				</Link>
			</div>
		</div>
	);
}

export default DashboardPage;
