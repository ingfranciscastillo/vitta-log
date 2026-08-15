import {
	AddSquareIcon,
	DumbbellIcon,
	TrashBinTrashIcon,
} from "@solar-icons/react/bold";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PremiumGate } from "#/components/premium-gate";
import { StatCard } from "#/components/stat-card";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { activitiesQuery } from "#/lib/activities";
import { createActivity, deleteActivity } from "#/lib/activities.functions";
import type { ActivityIntensity } from "#/lib/health-types";
import { activityStats } from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import {
	formatDate,
	nowTimeStr,
	sortByDateDesc,
	todayStr,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/activity")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(activitiesQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: ActivityPage,
});

const INTENSITY: Array<{ id: ActivityIntensity; label: string }> = [
	{ id: "low", label: "Suave" },
	{ id: "medium", label: "Moderada" },
	{ id: "high", label: "Intensa" },
];

function ActivityPage() {
	const activities = useSuspenseQuery(activitiesQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const qc = useQueryClient();

	const stats = useMemo(() => activityStats(activities, 7), [activities]);
	const history = useMemo(
		() => sortByDateDesc(activities).slice(0, 15),
		[activities],
	);

	const [type, setType] = useState<string>("");
	const [duration, setDuration] = useState<string>("");
	const [date, setDate] = useState<string>(todayStr());
	const [intensity, setIntensity] = useState<ActivityIntensity>("medium");

	const invalidate = async () => {
		await qc.invalidateQueries({ queryKey: ["activities"] });
	};

	const createMut = useMutation({
		mutationFn: (vars: {
			type: string;
			durationMinutes: number;
			date: string;
			time: string;
			intensity: ActivityIntensity;
		}) =>
			createActivity({
				data: {
					type: vars.type,
					durationMinutes: vars.durationMinutes,
					date: vars.date,
					time: vars.time,
					intensity: vars.intensity,
				},
			}),
		onSuccess: async () => {
			toast.success("Actividad registrada");
			setType("");
			setDuration("");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo registrar la actividad");
		},
	});

	const deleteMut = useMutation({
		mutationFn: (id: string) => deleteActivity({ data: { id } }),
		onSuccess: async () => {
			toast.success("Actividad eliminada");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo eliminar la actividad");
		},
	});

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl">Actividad</h1>
				<PremiumGate
					title="Actividad física"
					description="Registra entrenamientos, consulta tu historial y tus estadísticas semanales con Premium."
				/>
			</div>
		);
	}

	const handleAdd = () => {
		const d = parseInt(duration, 10);
		if (!type.trim() || Number.isNaN(d) || d <= 0) return;
		createMut.mutate({
			type: type.trim(),
			durationMinutes: d,
			date,
			time: nowTimeStr(),
			intensity,
		});
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Actividad</h1>

			<div className="grid grid-cols-3 gap-3">
				<StatCard
					label="Minutos (7d)"
					value={stats.totalMinutes}
					icon={DumbbellIcon}
				/>
				<StatCard label="Sesiones" value={stats.sessions} />
				<StatCard label="Más frecuente" value={stats.topType || "—"} />
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="font-display text-sm">Registrar actividad</div>
				<Input
					value={type}
					onChange={(e) => setType(e.target.value)}
					placeholder="Tipo (correr, pesas, yoga...)"
					className="h-10"
				/>
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Duración (min)
						</Label>
						<Input
							type="number"
							inputMode="numeric"
							value={duration}
							onChange={(e) => setDuration(e.target.value)}
							className="h-10"
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Fecha
						</Label>
						<Input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="h-10"
						/>
					</div>
				</div>
				<div className="space-y-1.5">
					<Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
						Intensidad
					</Label>
					<Select
						value={intensity}
						onValueChange={(v) => setIntensity(v as ActivityIntensity)}
					>
						<SelectTrigger className="h-10">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{INTENSITY.map((i) => (
								<SelectItem key={i.id} value={i.id}>
									{i.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Button
					type="button"
					onClick={handleAdd}
					className="w-full h-11 font-display"
					disabled={createMut.isPending}
				>
					<AddSquareIcon className="w-4 h-4 mr-2" /> Añadir actividad
				</Button>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="font-display text-sm mb-2">Historial</div>
				{history.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Sin actividades registradas.
					</p>
				) : (
					<div className="space-y-2">
						{history.map((a) => (
							<div
								key={a.id ?? `${a.date}-${a.type}-${a.time}`}
								className="flex items-center justify-between text-sm"
							>
								<div>
									<div className="font-medium">{a.type}</div>
									<div className="text-xs text-muted-foreground">
										{formatDate(a.date)} · {a.durationMinutes} min
										{a.intensity
											? ` · ${INTENSITY.find((i) => i.id === a.intensity)?.label ?? a.intensity}`
											: ""}
									</div>
								</div>
								<button
									type="button"
									onClick={() => a.id && deleteMut.mutate(a.id)}
									className="text-muted-foreground hover:text-destructive"
									aria-label="Eliminar"
								>
									<TrashBinTrashIcon className="w-4 h-4" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
