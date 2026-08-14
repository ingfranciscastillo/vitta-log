import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { GoalCard } from "#/components/goal-card";
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
import { currentGoalQuery } from "#/lib/goals";
import { upsertGoal } from "#/lib/goals.functions";
import { weightEntriesQuery } from "#/lib/weight";
import { listWeightEntries } from "#/lib/weight.functions";
import { computeStats, fromDisplay, toDisplay } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/goals")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(currentGoalQuery());
		context.queryClient.ensureQueryData(weightEntriesQuery());
	},
	component: GoalsPage,
});

function GoalsPage() {
	const { goal, unit } = useSuspenseQuery(currentGoalQuery()).data!;
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const stats = computeStats(entries);
	const qc = useQueryClient();

	const [editing, setEditing] = useState<boolean>(!goal);
	const [target, setTarget] = useState<string>(
		goal?.target_weight != null
			? toDisplay(goal.target_weight, unit).toFixed(1)
			: "",
	);
	const [date, setDate] = useState<string>(goal?.target_date ?? "");
	const [pace, setPace] = useState<"slow" | "moderate" | "fast">(
		(goal?.pace as "slow" | "moderate" | "fast") ?? "moderate",
	);

	const saveMut = useMutation({
		mutationFn: (vars: {
			targetWeight: number;
			targetDate: string | null;
			pace: "slow" | "moderate" | "fast";
		}) => upsertGoal({ data: vars }),
		onSuccess: async () => {
			toast.success("Objetivo guardado");
			setEditing(false);
			await qc.invalidateQueries({ queryKey: ["current-goal"] });
		},
		onError: () => {
			toast.error("No se pudo guardar el objetivo");
		},
	});

	const save = () => {
		const kg = fromDisplay(parseFloat(target), unit);
		if (Number.isNaN(kg) || kg <= 0) return;
		saveMut.mutate({
			targetWeight: kg,
			targetDate: date || null,
			pace,
		});
	};

	const handleCancel = () => {
		setEditing(false);
		if (goal) {
			setTarget(
				goal.target_weight != null
					? toDisplay(goal.target_weight, unit).toFixed(1)
					: "",
			);
			setDate(goal.target_date ?? "");
			setPace((goal.pace as "slow" | "moderate" | "fast") ?? "moderate");
		}
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Objetivo</h1>

			{goal && !editing ? (
				<>
					<GoalCard
						goal={goal}
						current={stats.current ?? 0}
						unit={unit}
						onEdit={() => setEditing(true)}
					/>
					<Button
						variant="outline"
						onClick={() => setEditing(true)}
						className="w-full"
					>
						Editar objetivo
					</Button>
				</>
			) : (
				<div className="rounded-2xl bg-card border border-border p-5 space-y-4">
					<div className="space-y-1.5">
						<Label>Peso objetivo ({unit})</Label>
						<Input
							type="text"
							inputMode="decimal"
							value={target}
							onChange={(e) =>
								setTarget(
									e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."),
								)
							}
							className="h-11"
							placeholder="0.0"
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Fecha objetivo (opcional)</Label>
						<Input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="h-11"
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Ritmo deseado</Label>
						<Select
							value={pace}
							onValueChange={(v) => setPace(v as "slow" | "moderate" | "fast")}
						>
							<SelectTrigger className="h-11">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="slow">Lento (0.25 kg/sem)</SelectItem>
								<SelectItem value="moderate">Moderado (0.5 kg/sem)</SelectItem>
								<SelectItem value="fast">Rápido (0.75 kg/sem)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-2">
						{goal && (
							<Button
								variant="outline"
								onClick={handleCancel}
								className="flex-1 h-11"
							>
								Cancelar
							</Button>
						)}
						<Button
							onClick={save}
							disabled={saveMut.isPending}
							className="flex-1 h-11 font-display"
						>
							{saveMut.isPending && <Bars className="w-3 h-3 mr-1.5" />}
							Guardar
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// Suppress unused warning: listWeightEntries is used by the server fn via the weight.functions module path
void listWeightEntries;
