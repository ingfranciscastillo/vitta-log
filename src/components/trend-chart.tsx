import { type ReactElement, useMemo } from "react";
import {
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatDate } from "#/lib/weight-utils";

type TrendPoint = {
	date: string;
	value: number;
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
	unit?: string;
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
						{p.value != null ? Number(p.value).toFixed(1) : "—"}
						{unit ? ` ${unit}` : ""}
					</span>
				</div>
			))}
		</div>
	);
}

type TrendChartProps = {
	data: TrendPoint[];
	unit?: string;
	goalValue?: number | null;
	color?: string;
	height?: number;
	name?: string;
};

export function TrendChart({
	data,
	unit,
	goalValue,
	color = "hsl(var(--primary))",
	height = 220,
	name = "Valor",
}: TrendChartProps) {
	const chartData = useMemo<TrendPoint[]>(
		() => (data || []).map((d) => ({ date: d.date, value: d.value })),
		[data],
	);

	if (chartData.length === 0) {
		return (
			<div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
				Sin datos suficientes
			</div>
		);
	}

	return (
		<div style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={chartData}
					margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
				>
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
					{goalValue != null && (
						<ReferenceLine
							y={goalValue}
							stroke="hsl(var(--accent))"
							strokeDasharray="5 5"
						/>
					)}
					<Line
						type="monotone"
						dataKey="value"
						stroke={color}
						strokeWidth={2.5}
						dot={false}
						name={name}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export default TrendChart;
