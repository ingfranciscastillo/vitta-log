import {
	AddCircleIcon,
	MinusCircleIcon,
} from "@solar-icons/react/line-duotone";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "#/components/ui/drawer";
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
	const [val, setVal] = useState<string>(String(initial));

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
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="rounded-t-3xl max-w-md mx-auto">
				<DrawerHeader className="text-center pb-0">
					<DrawerTitle className="font-display text-lg">{title}</DrawerTitle>
				</DrawerHeader>

				<div className="px-4 pt-2">
					<div className="flex items-center justify-center gap-3 py-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Restar"
							className="rounded-full h-12 w-12 shrink-0"
							onClick={() => stepVal(-step)}
						>
							<MinusCircleIcon
								secondaryOpacity={0}
								size={30}
								className="w-5 h-5"
							/>
						</Button>
						<div className="flex items-baseline">
							<Input
								type="text"
								inputMode="decimal"
								value={val}
								onChange={(e) =>
									setVal(
										e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."),
									)
								}
								className="font-display text-4xl text-center tabular-nums border-0 bg-transparent focus-visible:ring-0 w-32 px-0 h-14"
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
							aria-label="Sumar"
							className="rounded-full h-12 w-12 shrink-0"
							onClick={() => stepVal(step)}
						>
							<AddCircleIcon
								secondaryOpacity={0}
								size={30}
								className="w-5 h-5"
							/>
						</Button>
					</div>
				</div>

				<DrawerFooter className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
					<Button
						type="button"
						onClick={handleSave}
						className="w-full h-12 rounded-xl font-display text-sm"
					>
						Guardar
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default QuickAddDialog;
