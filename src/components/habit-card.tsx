import { AddCircleIcon } from "@solar-icons/react/line-duotone";
import { type ComponentType, useState } from "react";
import { ProgressBar } from "#/components/progress-bar";
import { QuickAddDialog } from "#/components/quick-add-dialog";

type HabitCardProps = {
	label: string;
	icon?: ComponentType<{ className?: string }>;
	value: number;
	goal: number;
	unit?: string;
	step?: number;
	onAdd: (step: number) => void;
	onSet: (value: number) => void;
};

export function HabitCard({
	label,
	icon: Icon,
	value,
	goal,
	unit,
	step = 1,
	onSet,
}: HabitCardProps) {
	const [open, setOpen] = useState(false);
	const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;

	return (
		<div className="rounded-2xl bg-card border border-border p-4">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					{Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
					<span className="text-sm font-medium">{label}</span>
				</div>
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="text-right"
				>
					<span className="font-display text-lg">
						{Math.round(value).toLocaleString()}
					</span>
					<span className="text-xs text-muted-foreground">
						{" "}
						/ {goal.toLocaleString()} {unit}
					</span>
				</button>
			</div>
			<ProgressBar value={value} goal={goal} />
			<div className="flex items-center justify-between mt-2">
				<span className="text-[11px] text-muted-foreground">
					{pct}% del objetivo
				</span>
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-[0.92] transition-transform"
					aria-label={`Añadir ${label}`}
				>
					<AddCircleIcon secondaryOpacity={0} size={30} className="w-4 h-4" />
				</button>
			</div>
			<QuickAddDialog
				open={open}
				onOpenChange={setOpen}
				title={label}
				unit={unit}
				step={step}
				initial={value}
				onSave={onSet}
			/>
		</div>
	);
}

export default HabitCard;
