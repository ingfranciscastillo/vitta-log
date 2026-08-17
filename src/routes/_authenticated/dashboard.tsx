import {
	AddCircleIcon,
	MinusCircleIcon,
} from "@solar-icons/react/line-duotone";
import {
	BellIcon,
	CalendarIcon,
	ChartSquareIcon,
	FireIcon,
	GraphDownIcon,
	GraphUpIcon,
	LockIcon,
	MoonIcon,
	PulseIcon,
	TargetIcon,
	WalkingIcon,
} from "@solar-icons/react/outline";
import { StarsMinimalisticIcon } from "@solar-icons/react/outline/stars-minimalistic";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { GoalCard } from "#/components/goal-card";
import { InsightsList } from "#/components/insights-list";
import { ProgressBar } from "#/components/progress-bar";
import { StatCard } from "#/components/stat-card";
import { StreakCard } from "#/components/streak-card";
import { WaterCounter } from "#/components/water-counter";
import { WeightChart } from "#/components/weight-chart";
import { currentGoalQuery } from "#/lib/goals";
import { habitLogsQuery } from "#/lib/habits";
import { addHabitLog } from "#/lib/habits.functions";
import type { HealthGoals } from "#/lib/health-types";
import {
	dailySuggestion,
	habitToday,
	mealTotals,
	reminders,
} from "#/lib/health-utils";
import { mealsQuery } from "#/lib/meals";
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
	todayStr,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightStatsQuery());
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentGoalQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
		context.queryClient.ensureQueryData(habitLogsQuery());
		context.queryClient.ensureQueryData(mealsQuery());
	},
	component: DashboardPage,
});

const HABITS: Array<{
	type: "steps" | "sleep";
	label: string;
	icon: typeof WalkingIcon;
	unit: string;
	step: number;
}> = [
	{ type: "steps", label: "Pasos", icon: WalkingIcon, unit: "", step: 500 },
	{ type: "sleep", label: "Sueño", icon: MoonIcon, unit: "h", step: 0.5 },
];

function DashboardPage() {
	const { entries, unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const { goal } = useSuspenseQuery(currentGoalQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const habits = useSuspenseQuery(habitLogsQuery()).data!;
	const meals = useSuspenseQuery(mealsQuery()).data!;
	const qc = useQueryClient();

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

	const goals: HealthGoals = useMemo(
		() => ({
			water: me?.waterGoal != null ? Number(me.waterGoal) : 2000,
			steps: me?.stepsGoal != null ? Number(me.stepsGoal) : 8000,
			sleep: me?.sleepGoal != null ? Number(me.sleepGoal) : 8,
			calories: me?.calorieGoal != null ? Number(me.calorieGoal) : 2000,
		}),
		[me],
	);

	const today = todayStr();
	const suggestion = useMemo(
		() => dailySuggestion({ entries, habits, meals, goals }),
		[entries, habits, meals, goals],
	);
	const rems = useMemo(
		() => reminders({ entries, habits, meals }),
		[entries, habits, meals],
	);
	const calsToday = useMemo(
		() => mealTotals(meals, today).calories,
		[meals, today],
	);

	const delta = stats.changeVsLast;
	const DeltaIcon =
		delta < 0 ? GraphDownIcon : delta > 0 ? GraphUpIcon : MinusCircleIcon;

	const logHabitMut = useMutation({
		mutationFn: (vars: { type: "steps" | "sleep"; step: number }) =>
			addHabitLog({
				data: { type: vars.type, date: today, step: vars.step },
			}),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["habit-logs"] });
		},
	});

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
						onEdit={() => {
							window.location.href = "/goals";
						}}
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

			<WaterCounter />

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="flex items-center justify-between">
					<span className="font-display text-sm">Hábitos de hoy</span>
					<Link to="/habits" className="text-xs text-primary">
						Ver todo
					</Link>
				</div>
				{HABITS.map((h) => {
					const v = habitToday(habits, h.type);
					const g = goals[h.type];
					const Icon = h.icon;
					return (
						<div key={h.type} className="flex items-center gap-3">
							<Icon className="w-4 h-4 text-muted-foreground shrink-0" />
							<div className="flex-1">
								<div className="flex justify-between text-xs mb-1">
									<span>{h.label}</span>
									<span className="text-muted-foreground">
										{Math.round(v).toLocaleString()} / {g.toLocaleString()}{" "}
										{h.unit}
									</span>
								</div>
								<ProgressBar value={v} goal={g} />
							</div>
							<button
								type="button"
								onClick={() =>
									logHabitMut.mutate({ type: h.type, step: h.step })
								}
								className="group w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform hover:bg-primary/20 ring-1 ring-primary/5 hover:ring-primary/15"
								aria-label={`Añadir ${h.label}`}
							>
								<AddCircleIcon
									size={30}
									secondaryOpacity={0}
									className="w-5 h-5 transition-transform group-hover:rotate-90"
								/>
							</button>
						</div>
					);
				})}
			</div>

			<Link
				to="/nutrition"
				className="block rounded-2xl bg-card border border-border p-4 hover:bg-muted transition-colors"
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FireIcon className="w-4 h-4 text-primary" />
						<span className="font-display text-sm">Nutrición</span>
					</div>
					{!isPremium && (
						<LockIcon className="w-3.5 h-3.5 text-muted-foreground" />
					)}
				</div>
				<p className="text-xs text-muted-foreground mt-1">
					{isPremium
						? `${Math.round(calsToday)} / ${goals.calories} kcal hoy`
						: "Desbloquea con Premium"}
				</p>
			</Link>

			{entries.length > 0 && (
				<div className="rounded-2xl bg-card border border-border p-4">
					<div className="flex items-center justify-between mb-2">
						<span className="font-display text-sm">Tendencia (30 días)</span>
						<Link to="/charts" className="text-xs text-primary">
							Ver más
						</Link>
					</div>
					<WeightChart
						entries={last30}
						goal={goal}
						unit={unit}
						showMA={false}
						showTrend
						showGoal={false}
					/>
				</div>
			)}

			<div className="rounded-2xl bg-accent/15 border border-accent/40 p-4">
				<div className="flex items-center gap-2 mb-1">
					<StarsMinimalisticIcon className="w-4 h-4 text-accent-foreground" />
					<span className="font-display text-sm">Sugerencia del día</span>
				</div>
				<p className="text-sm">{suggestion}</p>
			</div>

			{rems.length > 0 && (
				<div className="space-y-2">
					{rems.map((r) => (
						<div
							key={crypto.randomUUID()}
							className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3"
						>
							<BellIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
							<span className="text-sm">{r}</span>
						</div>
					))}
				</div>
			)}

			<div>
				<div className="flex items-center gap-2 mb-2">
					<ChartSquareIcon className="w-4 h-4 text-primary" />
					<span className="font-display text-sm">Rachas</span>
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
				<Link
					to="/pricing"
					className="block rounded-2xl bg-accent/20 border border-accent/40 p-4 hover:bg-accent/30 transition-colors"
				>
					<div className="flex items-center gap-2 mb-1">
						<StarsMinimalisticIcon className="w-4 h-4 text-accent-foreground" />
						<span className="font-display text-sm">Desbloquea Premium</span>
					</div>
					<p className="text-xs text-muted-foreground">
						Medidas, nutrición, ayuno, actividad y resumen semanal por $12.99.
					</p>
				</Link>
			)}
		</div>
	);
}

export default DashboardPage;
