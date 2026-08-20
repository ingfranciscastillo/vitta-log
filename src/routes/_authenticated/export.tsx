import { DocumentIcon, FileIcon } from "@solar-icons/react/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PremiumGate } from "#/components/premium-gate";
import { Button } from "#/components/ui/button";
import { currentUserQuery } from "#/lib/profile";
import { weightEntriesQuery } from "#/lib/weight";

export const Route = createFileRoute("/_authenticated/export")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: ExportPage,
});

function download(name: string, content: string, type: string): void {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
	URL.revokeObjectURL(url);
}

function ExportPage() {
	const { data: entries } = useSuspenseQuery(weightEntriesQuery());
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const [busy, setBusy] = useState<"csv" | "json" | null>(null);

	const stats = useMemo(() => {
		if (!entries.length) return { count: 0, first: null, last: null };
		const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
		return {
			count: entries.length,
			first: sorted[0].date,
			last: sorted[sorted.length - 1].date,
		};
	}, [entries]);

	const sortedEntries = useMemo(
		() => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
		[entries],
	);

	if (!isPremium) {
		return (
			<div className="space-y-6">
				<h1 className="font-display text-xl text-balance">Exportar datos</h1>
				<PremiumGate
					title="Exportación de datos"
					description="Descarga tu historial completo en CSV o JSON con Premium."
				/>
			</div>
		);
	}

	const exportCSV = () => {
		setBusy("csv");
		try {
			const rows: (string | number)[][] = [
				["date", "time", "weight_kg", "note"],
			];
			sortedEntries.forEach((e) => {
				rows.push([
					e.date,
					e.time ?? "",
					e.weight,
					(e.note ?? "").replace(/"/g, '""'),
				]);
			});
			const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
			download("vitta.csv", csv, "text/csv");
			toast.success("CSV descargado");
		} catch {
			toast.error("No se pudo generar el CSV");
		} finally {
			setBusy(null);
		}
	};

	const exportJSON = () => {
		setBusy("json");
		try {
			const data = sortedEntries.map((e) => ({
				date: e.date,
				time: e.time ?? null,
				weight: e.weight,
				note: e.note ?? null,
			}));
			download("vitta.json", JSON.stringify(data, null, 2), "application/json");
			toast.success("JSON descargado");
		} catch {
			toast.error("No se pudo generar el JSON");
		} finally {
			setBusy(null);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="font-display text-xl text-balance">Exportar datos</h1>

			<section className="rounded-2xl bg-card border border-border p-4 space-y-1.5">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Registros</span>
					<span className="font-display">{stats.count}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Primer registro</span>
					<span>{stats.first || "—"}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Último registro</span>
					<span>{stats.last || "—"}</span>
				</div>
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Descargar historial</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Button
						onClick={exportCSV}
						disabled={!stats.count || busy !== null}
						className="h-16 justify-start px-4"
					>
						<DocumentIcon className="w-5 h-5 mr-3" />
						<span className="text-left">
							<span className="block font-display">CSV</span>
							<span className="block text-[11px] font-normal opacity-80">
								Para hojas de cálculo
							</span>
						</span>
					</Button>
					<Button
						onClick={exportJSON}
						disabled={!stats.count || busy !== null}
						variant="outline"
						className="h-16 justify-start px-4"
					>
						<FileIcon className="w-5 h-5 mr-3" />
						<span className="text-left">
							<span className="block font-display">JSON</span>
							<span className="block text-[11px] font-normal opacity-80">
								Para análisis externo
							</span>
						</span>
					</Button>
				</div>
				{!stats.count && (
					<p className="text-sm text-muted-foreground text-pretty">
						Aún no tienes registros para exportar.
					</p>
				)}
			</section>
		</div>
	);
}
