import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PremiumGate } from "#/components/premium-gate";
import { DatePicker } from "#/components/ui/date-picker";
import { Switch } from "#/components/ui/switch";
import { WeightChart } from "#/components/weight-chart";
import { currentGoalQuery } from "#/lib/goals";
import { currentUserQuery } from "#/lib/profile";
import { weightEntriesQuery } from "#/lib/weight";
import { sortByDateAsc } from "#/lib/weight-utils";

type RangeId = 7 | 30 | 90 | 365 | "all" | "custom";

const RANGES: Array<{ id: RangeId; label: string }> = [
	{ id: 7, label: "7d" },
	{ id: 30, label: "30d" },
	{ id: 90, label: "90d" },
	{ id: 365, label: "Año" },
	{ id: "all", label: "Todo" },
	{ id: "custom", label: "Custom" },
];

function ToggleRow({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3">
			<span className="text-sm">{label}</span>
			<Switch checked={checked} onCheckedChange={onChange} />
		</div>
	);
}

export const Route = createFileRoute("/_authenticated/charts")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentGoalQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: ChartsPage,
});

function ChartsPage() {
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const { goal, unit } = useSuspenseQuery(currentGoalQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;

	const [range, setRange] = useState<RangeId>(30);
	const [from, setFrom] = useState<string>("");
	const [to, setTo] = useState<string>("");
	const [showMA, setShowMA] = useState<boolean>(true);
	const [showTrend, setShowTrend] = useState<boolean>(true);
	const [showGoal, setShowGoal] = useState<boolean>(true);

	const filtered = useMemo(() => {
		const asc = sortByDateAsc(entries);
		if (range === "all") return asc;
		if (range === "custom") {
			return asc.filter(
				(e) => (!from || e.date >= from) && (!to || e.date <= to),
			);
		}
		if (asc.length === 0) return [];
		const cutoff =
			new Date(`${asc[asc.length - 1].date}T00:00:00`).getTime() -
			range * 86400000;
		return asc.filter(
			(e) => new Date(`${e.date}T00:00:00`).getTime() >= cutoff,
		);
	}, [entries, range, from, to]);

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl text-balance">Gráficos</h1>
				<PremiumGate
					title="Gráficos avanzados"
					description="Tendencias, media móvil y línea de meta con Premium."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Gráficos</h1>

			<div className="flex gap-1.5 overflow-x-auto pb-1">
				{RANGES.map((r) => (
					<button
						key={r.id}
						type="button"
						onClick={() => setRange(r.id)}
						className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
							range === r.id
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{r.label}
					</button>
				))}
			</div>

			{range === "custom" && (
				<div className="flex gap-2">
					<DatePicker
						id="charts-from"
						value={from}
						onChange={(v) => setFrom(v ?? "")}
						className="h-9 text-sm"
					/>
					<DatePicker
						id="charts-to"
						value={to}
						onChange={(v) => setTo(v ?? "")}
						className="h-9 text-sm"
					/>
				</div>
			)}

			<div className="rounded-2xl bg-card border border-border p-4">
				<WeightChart
					entries={filtered}
					goal={showGoal ? goal : null}
					unit={unit}
					showMA={showMA}
					showTrend={showTrend}
					showGoal={showGoal}
				/>
			</div>

			<div className="space-y-2">
				<ToggleRow
					label="Media móvil (7 días)"
					checked={showMA}
					onChange={setShowMA}
				/>
				<ToggleRow
					label="Línea de tendencia"
					checked={showTrend}
					onChange={setShowTrend}
				/>
				<ToggleRow
					label="Línea de meta"
					checked={showGoal}
					onChange={setShowGoal}
				/>
			</div>
		</div>
	);
}
