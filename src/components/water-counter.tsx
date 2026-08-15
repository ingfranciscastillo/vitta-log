import { AddCircleIcon, WaterdropIcon } from "@solar-icons/react/outline";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ProgressBar } from "#/components/progress-bar";
import { habitLogsQuery } from "#/lib/habits";
import { addHabitLog } from "#/lib/habits.functions";
import { habitToday } from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import { todayStr } from "#/lib/weight-utils";

const GLASS_ML = 250;

export function WaterCounter() {
	const habits = useSuspenseQuery(habitLogsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const qc = useQueryClient();

	const today = todayStr();
	const value = habitToday(habits, "water");
	const goal = me?.waterGoal != null ? Number(me.waterGoal) : 2000;
	const glasses = Math.round(value / GLASS_ML);
	const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;

	const addMut = useMutation({
		mutationFn: () =>
			addHabitLog({
				data: {
					type: "water",
					date: today,
					step: GLASS_ML,
				},
			}),
		onSuccess: async () => {
			toast.success(
				`+1 vaso · ${Math.round(value + GLASS_ML)} ml de ${goal} ml`,
			);
			await qc.invalidateQueries({ queryKey: ["habit-logs"] });
		},
		onError: () => {
			toast.error("No se pudo registrar el vaso");
		},
	});

	const add = () => {
		addMut.mutate();
	};

	return (
		<div className="rounded-2xl bg-card border border-border p-4">
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<WaterdropIcon className="w-4 h-4 text-primary" />
						<span className="font-display text-sm">Agua hoy</span>
					</div>
					<div className="flex items-baseline gap-2">
						<span className="font-display text-3xl leading-none">
							{glasses}
						</span>
						<span className="text-sm text-muted-foreground">
							vasos · {Math.round(value)} / {goal} ml
						</span>
					</div>
				</div>
				<button
					type="button"
					onClick={add}
					disabled={addMut.isPending}
					className="group relative w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0 ring-2 ring-primary/15 hover:ring-primary/25"
					aria-label="Añadir un vaso de agua"
				>
					<AddCircleIcon className="w-7 h-7 transition-transform group-hover:rotate-90" />
				</button>
			</div>
			<div className="mt-3">
				<ProgressBar value={value} goal={goal} />
				<div className="flex justify-between text-[10px] text-muted-foreground mt-1">
					<span>0</span>
					<span>{Math.round(pct)}%</span>
					<span>{goal} ml</span>
				</div>
			</div>
		</div>
	);
}

export default WaterCounter;
