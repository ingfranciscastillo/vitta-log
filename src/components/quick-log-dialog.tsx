import {
	AddCircleIcon,
	DisketteIcon,
	MinusCircleIcon,
	NotebookIcon,
	RestartIcon,
} from "@solar-icons/react/bold";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	fromDisplay,
	nowTimeStr,
	toDisplay,
	todayStr,
	type WeightUnit,
} from "#/lib/weight-utils";

type SavePayload = {
	weight: number;
	date: string;
	time: string;
	note?: string;
};

type QuickLogDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lastWeightKg: number | null | undefined;
	unit: WeightUnit;
	onSave: (payload: SavePayload) => void;
	onRepeat: (payload: SavePayload) => void;
};

export function QuickLogDialog({
	open,
	onOpenChange,
	lastWeightKg,
	unit,
	onSave,
	onRepeat,
}: QuickLogDialogProps) {
	const lastDisp =
		lastWeightKg != null ? toDisplay(lastWeightKg, unit).toFixed(1) : "";
	const [val, setVal] = useState<string>(lastDisp);
	const [date, setDate] = useState<string>(todayStr());
	const [time, setTime] = useState<string>(nowTimeStr());
	const [note, setNote] = useState<string>("");
	const [showNote, setShowNote] = useState<boolean>(false);

	useEffect(() => {
		if (open) {
			setVal(lastDisp);
			setDate(todayStr());
			setTime(nowTimeStr());
			setNote("");
			setShowNote(false);
		}
	}, [open, lastDisp]);

	const step = (d: number): void => {
		const n = parseFloat(val || "0") || 0;
		setVal(Math.max(0, n + d).toFixed(1));
	};

	const handleSave = (): void => {
		const kg = fromDisplay(parseFloat(val), unit);
		if (Number.isNaN(kg) || kg <= 0) return;
		onSave({ weight: kg, date, time, note: note || undefined });
		onOpenChange(false);
	};

	const handleRepeat = (): void => {
		if (lastWeightKg == null) return;
		onRepeat({
			weight: lastWeightKg,
			date: todayStr(),
			time: nowTimeStr(),
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm rounded-3xl">
				<DialogHeader>
					<DialogTitle className="font-display text-center text-lg">
						Registrar peso
					</DialogTitle>
				</DialogHeader>

				<div className="flex items-center justify-center gap-3 mt-2">
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="rounded-full h-12 w-12 shrink-0"
						onClick={() => step(-0.1)}
						aria-label="Restar 0.1"
					>
						<MinusCircleIcon className="w-7 h-7" />
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
							placeholder="0.0"
						/>
						<span className="font-display text-lg text-muted-foreground ml-1">
							{unit}
						</span>
					</div>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="rounded-full h-12 w-12 shrink-0"
						onClick={() => step(0.1)}
						aria-label="Sumar 0.1"
					>
						<AddCircleIcon className="w-7 h-7" />
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-3 mt-3">
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
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Hora
						</Label>
						<Input
							type="time"
							value={time}
							onChange={(e) => setTime(e.target.value)}
							className="h-10"
						/>
					</div>
				</div>

				{showNote ? (
					<Input
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Nota (opcional)"
						className="h-10"
					/>
				) : (
					<button
						type="button"
						onClick={() => setShowNote(true)}
						className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						<NotebookIcon className="w-3.5 h-3.5" /> Añadir nota
					</button>
				)}

				<div className="space-y-2 mt-2">
					<Button
						onClick={handleSave}
						className="w-full h-12 rounded-xl font-display text-sm"
					>
						<DisketteIcon className="w-4 h-4 mr-2" /> Guardar
					</Button>
					{lastWeightKg != null && (
						<Button
							onClick={handleRepeat}
							variant="secondary"
							className="w-full h-11 rounded-xl text-sm"
						>
							<RestartIcon className="w-4 h-4 mr-2" /> Repetir último:{" "}
							{lastDisp} {unit}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default QuickLogDialog;
