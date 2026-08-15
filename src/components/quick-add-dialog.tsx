import {
	AddSquareIcon,
	DisketteIcon,
	MinusSquareIcon,
} from "@solar-icons/react/outline";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";

type QuickAddDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	unit?: string;
	step?: number;
	initial?: number;
	onSave: (value: number) => void;
};

export function QuickAddDialog({
	open,
	onOpenChange,
	title,
	unit,
	step = 1,
	initial = 0,
	onSave,
}: QuickAddDialogProps) {
	const [val, setVal] = useState(String(initial));

	useEffect(() => {
		if (open) setVal(String(initial));
	}, [open, initial]);

	const stepVal = (delta: number) => {
		const n = parseFloat(val || "0") || 0;
		setVal(Math.max(0, n + delta).toString());
	};

	const handleSave = () => {
		const n = parseFloat(val) || 0;
		if (n <= 0) return;
		onSave(n);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm rounded-3xl">
				<DialogHeader>
					<DialogTitle className="font-display text-center text-lg">
						{title}
					</DialogTitle>
				</DialogHeader>
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
							className="font-display text-4xl text-center border-0 bg-transparent focus-visible:ring-0 w-28 px-0 h-14"
							placeholder="0"
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
					onClick={handleSave}
					className="w-full h-12 rounded-xl font-display text-sm mt-2"
				>
					<DisketteIcon className="w-4 h-4 mr-2" /> Guardar
				</Button>
			</DialogContent>
		</Dialog>
	);
}

export default QuickAddDialog;
