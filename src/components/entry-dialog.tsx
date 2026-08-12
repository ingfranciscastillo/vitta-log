import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import WeightEntryForm from "#/components/weight-entry-form";
import type { WeightEntry, WeightUnit } from "#/lib/weight-utils";

type EntryDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initial?: WeightEntry | null;
	unit: WeightUnit;
	onSubmit: (payload: {
		weight: number;
		date: string;
		time?: string;
		note?: string;
	}) => void;
};

export function EntryDialog({
	open,
	onOpenChange,
	initial,
	unit,
	onSubmit,
}: EntryDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="font-display">
						{initial?.id ? "Editar registro" : "Añadir registro"}
					</DialogTitle>
				</DialogHeader>
				<WeightEntryForm
					initial={initial ?? null}
					unit={unit}
					submitLabel={initial?.id ? "Guardar cambios" : "Añadir"}
					onSubmit={(payload) => {
						onSubmit(payload);
						onOpenChange(false);
					}}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

export default EntryDialog;
