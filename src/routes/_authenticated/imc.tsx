import {
	GraphUpIcon,
	InfoCircleIcon,
	PulseIcon,
} from "@solar-icons/react/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PremiumGate } from "#/components/premium-gate";
import { StatCard } from "#/components/stat-card";
import { TrendChart } from "#/components/trend-chart";
import {
	healthyWeightRange,
	imcSeries,
	metricExplanations,
} from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import { weightStatsQuery } from "#/lib/statistics";
import {
	calcIMC,
	formatWeightValue,
	imcCategory,
	sortByDateAsc,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/imc")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightStatsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: IMCPage,
});

function IMCPage() {
	const { entries, unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const heightCm = me?.height != null ? Number(me.height) : null;
	const isPremium = !!me?.isPro;

	const asc = useMemo(() => sortByDateAsc(entries), [entries]);
	const latest = asc[asc.length - 1];
	const imc = latest && heightCm ? calcIMC(latest.weight, heightCm) : null;
	const cat = imcCategory(imc);
	const range = heightCm ? healthyWeightRange(heightCm) : null;
	const series = useMemo<Array<{ date: string; value: number }>>(
		() =>
			heightCm
				? imcSeries(entries, heightCm).map((p) => ({
						date: p.date,
						value: p.value ?? 0,
					}))
				: [],
		[entries, heightCm],
	);

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">IMC</h1>

			{!heightCm ? (
				<div className="rounded-2xl border border-dashed border-border p-6 text-center">
					<PulseIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
					<p className="text-sm text-muted-foreground mb-3">
						Guarda tu altura en tu perfil para calcular el IMC.
					</p>
					<Link
						to="/profile"
						className="inline-block text-sm text-primary font-medium"
					>
						Ir a mi perfil
					</Link>
				</div>
			) : !latest ? (
				<div className="rounded-2xl border border-dashed border-border p-6 text-center">
					<p className="text-sm text-muted-foreground">
						Registra tu peso para calcular el IMC.
					</p>
				</div>
			) : (
				<>
					<div className="rounded-3xl bg-primary text-primary-foreground p-6">
						<div className="text-[11px] uppercase tracking-wider opacity-70">
							IMC actual
						</div>
						<div className="font-display text-5xl leading-none mt-1">
							{imc != null ? imc.toFixed(1) : "—"}
						</div>
						{cat && <div className="text-sm mt-2 opacity-90">{cat.label}</div>}
					</div>

					<div className="grid grid-cols-2 gap-3">
						<StatCard
							label="Categoría"
							value={cat?.label ?? "—"}
							accent={
								cat?.tone === "green"
									? "text-emerald-600"
									: cat?.tone === "amber"
										? "text-amber-600"
										: cat?.tone === "red"
											? "text-rose-600"
											: cat?.tone === "blue"
												? "text-sky-600"
												: "text-primary"
							}
						/>
						<StatCard
							label="Peso actual"
							value={`${formatWeightValue(latest.weight, unit)} ${unit}`}
						/>
					</div>

					{range && (
						<div className="rounded-2xl bg-card border border-border p-4">
							<div className="font-display text-sm mb-1">
								Rango saludable orientativo
							</div>
							<p className="text-sm text-muted-foreground">
								Para tu altura, un peso entre{" "}
								<span className="font-medium text-foreground">
									{formatWeightValue(range.min, unit)}–
									{formatWeightValue(range.max, unit)} {unit}
								</span>{" "}
								corresponde a un IMC entre 18.5 y 24.9.
							</p>
						</div>
					)}

					<div className="rounded-2xl bg-muted/50 border border-border p-4 flex gap-2.5">
						<InfoCircleIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
						<p className="text-xs text-muted-foreground">
							{metricExplanations.imc}
						</p>
					</div>

					{isPremium ? (
						series.length >= 2 ? (
							<div className="rounded-2xl bg-card border border-border p-4">
								<div className="flex items-center gap-2 mb-2">
									<GraphUpIcon className="w-4 h-4 text-primary" />
									<span className="font-display text-sm">
										Evolución del IMC
									</span>
								</div>
								<TrendChart data={series} name="IMC" height={220} />
							</div>
						) : (
							<div className="rounded-2xl bg-card border border-border p-4 text-sm text-muted-foreground text-center">
								Registra más pesos para ver la evolución del IMC.
							</div>
						)
					) : (
						<PremiumGate
							title="Evolución del IMC"
							description="Visualiza cómo ha cambiado tu IMC a lo largo del tiempo con Premium."
						/>
					)}
				</>
			)}
		</div>
	);
}
