import {
	AddSquareIcon,
	DisketteIcon,
	DropperIcon,
	MinusSquareIcon,
	MoonIcon,
	WalkingIcon,
} from "@solar-icons/react/bold";
import { type ComponentType, useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";

type HabitType = "water" | "steps" | "sleep";

type HabitConfig = {
	label: string;
	unit: string;
	step: number;
	Icon: ComponentType<{ className?: string }>;
};

const CONFIG: Record<HabitType, HabitConfig> = {
	water: { label: "Agua", unit: "ml", step: 250, Icon: DropperIcon },
	steps: { label: "Pasos", unit: "", step: 500, Icon: WalkingIcon },
	sleep: { label: "Sueño", unit: "h", step: 0.5, Icon: MoonIcon },
};

type HabitLogDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	type: HabitType;
	currentToday: number;
	onSave: (type: HabitType, value: number) => void;
};

export function HabitLogDialog({
	open,
	onOpenChange,
	type,
	currentToday,
	onSave,
}: HabitLogDialogProps) {
	const cfg = CONFIG[type] ?? CONFIG.water;
	const { label, unit, step, Icon } = cfg;
	const [val, setVal] = useState<string>(String(step));

	useEffect(() => {
		if (open) setVal(String(step));
	}, [open, type, step]);

	const stepVal = (delta: number) => {
		const n = parseFloat(val || "0") || 0;
		const next = Math.max(0, n + delta);
		setVal(step < 1 ? next.toFixed(1) : String(Math.round(next)));
	};

	const handleSave = () => {
		const n = parseFloat(val) || 0;
		if (n <= 0) return;
		onSave(type, n);
		onOpenChange(false);
	};

	const displayCurrent = (v: number) =>
		step < 1 ? v.toFixed(1) : Math.round(v).toLocaleString();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm rounded-3xl">
				<DialogHeader>
					<DialogTitle className="font-display text-center text-lg flex items-center justify-center gap-2">
						<Icon className="w-4 h-4 text-primary" /> Añadir{" "}
						{label.toLowerCase()}
					</DialogTitle>
				</DialogHeader>

				<div className="text-center text-xs text-muted-foreground -mt-1">
					Hoy: {displayCurrent(currentToday)} {unit}
				</div>

				<div className="flex items-center justify-center gap-3 mt-2">
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="rounded-full h-12 w-12 shrink-0"
						onClick={() => stepVal(-step)}
					>
						<MinusSquareIcon className="w-5 h-5" />
					</Button>
					<div className="flex items-baseline">
						<Input
							type="text"
							inputMode="decimal"
							autoFocus
							value={val}
							onChange={(e) =>
								setVal(
									e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."),
								)
							}
							className="font-display text-4xl text-center border-0 bg-transparent focus-visible:ring-0 w-32 px-0 h-14"
							placeholder={String(step)}
						/>
						{unit && (
							<span className="font-display text-lg text-muted-foreground ml-1">
								{unit}
							</span>
						)}
					</div>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="rounded-full h-12 w-12 shrink-0"
						onClick={() => stepVal(step)}
					>
						<AddSquareIcon className="w-5 h-5" />
					</Button>
				</div>

				<Button
					type="button"
					onClick={handleSave}
					className="w-full h-12 rounded-xl font-display text-sm mt-2"
				>
					<DisketteIcon className="w-4 h-4 mr-2" /> Guardar
				</Button>
			</DialogContent>
		</Dialog>
	);
}

export default HabitLogDialog;
