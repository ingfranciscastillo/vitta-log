import { ExportIcon } from "@solar-icons/react/outline/export";
import { ImportIcon } from "@solar-icons/react/outline/import";
import { useRef } from "react";
import { Button } from "#/components/ui/button";
import type { WeightEntry } from "#/lib/weight-utils";

type ImportableEntry = Pick<WeightEntry, "date" | "time" | "weight" | "note">;

type ExportImportProps = {
	entries: WeightEntry[];
	onImport: (entries: ImportableEntry[]) => void;
};

function download(name: string, content: string, type: string): void {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
	URL.revokeObjectURL(url);
}

export function ExportImport({ entries, onImport }: ExportImportProps) {
	const fileRef = useRef<HTMLInputElement>(null);

	const exportCSV = (): void => {
		const rows: (string | number)[][] = [["date", "time", "weight_kg", "note"]];
		entries.forEach((e) =>
			rows.push([
				e.date,
				e.time ?? "",
				e.weight,
				(e.note ?? "").replace(/"/g, '""'),
			]),
		);
		const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
		download("myweight.csv", csv, "text/csv");
	};

	const exportJSON = (): void => {
		const data = entries.map((e) => ({
			date: e.date,
			time: e.time ?? null,
			weight: e.weight,
			note: e.note ?? null,
		}));
		download(
			"myweight.json",
			JSON.stringify(data, null, 2),
			"application/json",
		);
	};

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const parsed = JSON.parse(String(reader.result));
				if (Array.isArray(parsed)) {
					onImport(parsed as ImportableEntry[]);
				} else {
					alert("Archivo inválido");
				}
			} catch {
				alert("Archivo inválido");
			}
		};
		reader.readAsText(file);
		e.target.value = "";
	};

	return (
		<div className="flex flex-wrap gap-2">
			<Button variant="outline" onClick={exportCSV} className="h-10">
				<ExportIcon className="w-4 h-4 mr-1.5" /> CSV
			</Button>
			<Button variant="outline" onClick={exportJSON} className="h-10">
				<ExportIcon className="w-4 h-4 mr-1.5" /> JSON
			</Button>
			<Button
				variant="outline"
				onClick={() => fileRef.current?.click()}
				className="h-10"
			>
				<ImportIcon className="w-4 h-4 mr-1.5" /> Importar
			</Button>
			<input
				ref={fileRef}
				type="file"
				accept=".json"
				className="hidden"
				onChange={handleFile}
			/>
		</div>
	);
}

export default ExportImport;
