import { TrashBinTrashIcon } from "@solar-icons/react/outline";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PremiumGate } from "#/components/premium-gate";
import { TrendChart } from "#/components/trend-chart";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { bodyMeasurementsQuery } from "#/lib/body-measurements";
import {
	createBodyMeasurement,
	deleteBodyMeasurement,
} from "#/lib/body-measurements.functions";
import {
	latestMeasurement,
	MEASUREMENT_TYPES,
	measurementSeries,
} from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import { formatDate, sortByDateDesc, todayStr } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/measurements")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(bodyMeasurementsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: MeasurementsPage,
});

type MeasurementTypeId = (typeof MEASUREMENT_TYPES)[number]["id"];

function MeasurementsPage() {
	const bodyMeasurements = useSuspenseQuery(bodyMeasurementsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const qc = useQueryClient();

	const [sel, setSel] = useState<MeasurementTypeId>("waist");
	const [val, setVal] = useState<string>("");
	const [date, setDate] = useState<string>(todayStr());

	const meta = MEASUREMENT_TYPES.find((m) => m.id === sel)!;
	const series = useMemo(
		() => measurementSeries(bodyMeasurements, sel),
		[bodyMeasurements, sel],
	);
	const latest = latestMeasurement(bodyMeasurements, sel);
	const history = useMemo(
		() =>
			sortByDateDesc(bodyMeasurements.filter((m) => m.type === sel)).slice(
				0,
				10,
			),
		[bodyMeasurements, sel],
	);

	const invalidate = async () => {
		await qc.invalidateQueries({ queryKey: ["body-measurements"] });
	};

	const createMut = useMutation({
		mutationFn: (vars: {
			type: MeasurementTypeId;
			value: number;
			date: string;
		}) => createBodyMeasurement({ data: vars }),
		onSuccess: async () => {
			toast.success("Medida registrada");
			setVal("");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo registrar la medida");
		},
	});

	const deleteMut = useMutation({
		mutationFn: (id: string) => deleteBodyMeasurement({ data: { id } }),
		onSuccess: async () => {
			toast.success("Medida eliminada");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo eliminar la medida");
		},
	});

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl">Medidas</h1>
				<PremiumGate
					title="Medidas corporales"
					description="Registra cintura, cadera, pecho, brazos, muslos y más, y visualiza su evolución con Premium."
				/>
			</div>
		);
	}

	const save = () => {
		const v = parseFloat(val);
		if (Number.isNaN(v) || v <= 0) return;
		createMut.mutate({ type: sel, value: v, date });
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Medidas</h1>

			<div className="flex gap-1.5 overflow-x-auto pb-1">
				{MEASUREMENT_TYPES.map((m) => (
					<button
						key={m.id}
						type="button"
						onClick={() => setSel(m.id)}
						className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
							sel === m.id
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{m.label}
					</button>
				))}
			</div>

			<div className="rounded-2xl bg-primary text-primary-foreground p-5">
				<div className="text-[11px] uppercase tracking-wider opacity-70">
					{meta.label} actual
				</div>
				<div className="flex items-baseline gap-2 mt-1">
					<span className="font-display text-4xl leading-none">
						{latest ? latest.value.toFixed(1) : "—"}
					</span>
					<span className="font-display text-lg opacity-70">{meta.unit}</span>
				</div>
				{latest && (
					<div className="text-xs opacity-70 mt-2">
						{formatDate(latest.date)}
					</div>
				)}
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="font-display text-sm">Nuevo registro</div>
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Valor ({meta.unit})
						</Label>
						<Input
							type="number"
							inputMode="decimal"
							value={val}
							onChange={(e) => setVal(e.target.value)}
							className="h-11"
							placeholder="0"
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Fecha
						</Label>
						<DatePicker
							id="measurement-date"
							value={date}
							onChange={(v) => setDate(v ?? "")}
						/>
					</div>
				</div>
				<Button
					onClick={save}
					className="w-full h-11 font-display"
					disabled={createMut.isPending}
				>
					Añadir medida
				</Button>
			</div>

			{series.length >= 2 && (
				<div className="rounded-2xl bg-card border border-border p-4">
					<div className="font-display text-sm mb-2">Evolución</div>
					<TrendChart
						data={series}
						unit={meta.unit}
						name={meta.label}
						height={200}
					/>
				</div>
			)}

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="font-display text-sm mb-2">Historial</div>
				{history.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Sin registros de {meta.label.toLowerCase()}.
					</p>
				) : (
					<div className="space-y-1.5">
						{history.map((m) => (
							<div
								key={m.id ?? `${m.type}-${m.date}`}
								className="flex items-center justify-between text-sm"
							>
								<span className="text-muted-foreground">
									{formatDate(m.date)}
								</span>
								<span className="font-medium">
									{m.value.toFixed(1)} {meta.unit}
								</span>
								<button
									type="button"
									onClick={() => m.id && deleteMut.mutate(m.id)}
									className="text-muted-foreground hover:text-destructive"
									aria-label="Eliminar"
								>
									<TrashBinTrashIcon className="w-3.5 h-3.5" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
