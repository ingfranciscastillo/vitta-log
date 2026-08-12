import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { EntryDialog } from "#/components/entry-dialog";
import { HistoryTable } from "#/components/history-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { currentUserQuery } from "#/lib/profile";
import { weightEntriesQuery } from "#/lib/weight";
import {
	createWeightEntry,
	deleteWeightEntry,
	updateWeightEntry,
} from "#/lib/weight.functions";
import type { WeightEntry } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/history")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: HistoryPage,
});

type EntryPayload = {
	date: string;
	weight: number;
	time?: string;
	note?: string;
};

function HistoryPage() {
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const qc = useQueryClient();

	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [editing, setEditing] = useState<WeightEntry | null>(null);
	const [deleting, setDeleting] = useState<WeightEntry | null>(null);

	const createMut = useMutation({
		mutationFn: (vars: EntryPayload) => createWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro añadido");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
		},
		onError: () => {
			toast.error("No se pudo añadir el registro");
		},
	});

	const updateMut = useMutation({
		mutationFn: (vars: { id: string; data: EntryPayload }) =>
			updateWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro actualizado");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
		},
		onError: () => {
			toast.error("No se pudo actualizar el registro");
		},
	});

	const deleteMut = useMutation({
		mutationFn: (vars: { id: string }) => deleteWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro eliminado");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
		},
		onError: () => {
			toast.error("No se pudo eliminar el registro");
		},
	});

	const handleAdd = () => {
		setEditing(null);
		setDialogOpen(true);
	};

	const handleEdit = (e: WeightEntry) => {
		setEditing(e);
		setDialogOpen(true);
	};

	const handleSubmit = async (payload: EntryPayload) => {
		setDialogOpen(false);
		if (editing?.id) {
			await updateMut.mutateAsync({ id: editing.id, data: payload });
		} else {
			await createMut.mutateAsync(payload);
		}
	};

	const confirmDelete = async () => {
		if (!deleting?.id) return;
		await deleteMut.mutateAsync({ id: deleting.id });
		setDeleting(null);
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Historial</h1>
			<HistoryTable
				entries={entries}
				unit={me.weightUnit}
				onEdit={handleEdit}
				onAdd={handleAdd}
				onDelete={setDeleting}
			/>
			<EntryDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				initial={editing}
				unit={me.weightUnit}
				onSubmit={handleSubmit}
			/>
			<AlertDialog
				open={!!deleting}
				onOpenChange={(o) => !o && setDeleting(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
