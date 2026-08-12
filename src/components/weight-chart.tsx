import { type ReactElement, useMemo } from "react";
import {
	Brush,
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	formatDate,
	type Goal,
	movingAverageSeries,
	sortByDateAsc,
	toDisplay,
	trendSeries,
	type WeightEntry,
	type WeightUnit,
} from "#/lib/weight-utils";

type ChartRow = {
	date: string;
	weight?: number;
	ma?: number;
	trend?: number;
};

type TooltipPayloadItem = {
	name?: string;
	value?: number;
	color?: string;
};

type CustomTooltipProps = {
	active?: boolean;
	payload?: TooltipPayloadItem[];
	label?: string;
	unit: WeightUnit;
};

function CustomTooltip({
	active,
	payload,
	label,
	unit,
}: CustomTooltipProps): ReactElement | null {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-md">
			<div className="font-medium mb-1">{label && formatDate(label)}</div>
			{payload.map((p, i) => (
				<div
					key={i}
					style={{ color: p.color }}
					className="flex justify-between gap-3"
				>
					<span>{p.name}</span>
					<span className="font-medium">
						{p.value != null ? Number(p.value).toFixed(1) : "—"} {unit}
					</span>
				</div>
			))}
		</div>
	);
}

type WeightChartProps = {
	entries: WeightEntry[];
	goal: Goal | null | undefined;
	unit: WeightUnit;
	showMA?: boolean;
	showTrend?: boolean;
	showGoal?: boolean;
};

export function WeightChart({
	entries,
	goal,
	unit,
	showMA = true,
	showTrend = true,
	showGoal = true,
}: WeightChartProps) {
	const data = useMemo<ChartRow[]>(() => {
		const asc = sortByDateAsc(entries);
		const disp = asc.map((e) => ({
			date: e.date,
			weight: toDisplay(e.weight, unit),
		}));
		const ma = movingAverageSeries(asc, 7).map((m) => ({
			date: m.date,
			ma: m.ma != null ? toDisplay(m.ma, unit) : undefined,
		}));
		const tr = trendSeries(asc).map((t) => ({
			date: t.date,
			trend: toDisplay(t.trend, unit),
		}));
		const map: Record<string, ChartRow> = {};
		disp.forEach((d) => {
			map[d.date] = { ...(map[d.date] || {}), date: d.date, weight: d.weight };
		});
		if (showMA)
			ma.forEach((m) => {
				map[m.date] = { ...(map[m.date] || {}), ma: m.ma };
			});
		if (showTrend)
			tr.forEach((t) => {
				map[t.date] = { ...(map[t.date] || {}), trend: t.trend };
			});
		return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
	}, [entries, unit, showMA, showTrend]);

	const goalVal =
		goal && goal.target_weight != null
			? toDisplay(goal.target_weight, unit)
			: null;

	if (data.length === 0) {
		return (
			<div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
				Sin datos para mostrar
			</div>
		);
	}

	return (
		<div className="h-72 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={data}
					margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="hsl(var(--border))"
						opacity={0.5}
					/>
					<XAxis
						dataKey="date"
						tickFormatter={(d: string) =>
							formatDate(d, { day: "numeric", month: "short" })
						}
						tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
						minTickGap={24}
					/>
					<YAxis
						domain={["auto", "auto"]}
						tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
						width={48}
					/>
					<Tooltip content={<CustomTooltip unit={unit} />} />
					{showGoal && goalVal != null && (
						<ReferenceLine
							y={goalVal}
							stroke="hsl(var(--accent))"
							strokeDasharray="5 5"
							label={{
								value: "Meta",
								fontSize: 10,
								fill: "hsl(var(--accent))",
								position: "insideTopRight",
							}}
						/>
					)}
					<Line
						type="monotone"
						dataKey="weight"
						stroke="hsl(var(--primary))"
						strokeWidth={2.5}
						dot={false}
						name="Peso"
					/>
					{showMA && (
						<Line
							type="monotone"
							dataKey="ma"
							stroke="hsl(var(--accent))"
							strokeWidth={1.5}
							dot={false}
							name="Media 7d"
							strokeDasharray="4 4"
						/>
					)}
					{showTrend && (
						<Line
							type="monotone"
							dataKey="trend"
							stroke="hsl(var(--muted-foreground))"
							strokeWidth={1.5}
							dot={false}
							name="Tendencia"
						/>
					)}
					{data.length > 20 && (
						<Brush
							dataKey="date"
							height={20}
							stroke="hsl(var(--primary))"
							tickFormatter={(d: string) =>
								formatDate(d, { day: "numeric", month: "short" })
							}
						/>
					)}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export default WeightChart;
