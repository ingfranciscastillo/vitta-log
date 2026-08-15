import {
	DownloadIcon,
	QuestionCircleIcon,
	SettingsIcon,
	ShieldIcon,
	TargetIcon,
} from "@solar-icons/react/bold";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { ExportImport } from "#/components/export-import";
import { ThemeProvider, useTheme } from "#/components/theme-provider";
import { Button } from "#/components/ui/button";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { authClient } from "#/lib/auth-client";
import { currentUserQuery } from "#/lib/profile";
import {
	deleteAllMyData,
	importEntries,
	updateProfile,
} from "#/lib/profile.functions";
import { weightEntriesQuery } from "#/lib/weight";
import { cmToInches, inchesToCm, type WeightEntry } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/profile")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(currentUserQuery());
		context.queryClient.ensureQueryData(weightEntriesQuery());
	},
	component: ProfilePage,
});

function ProfilePage() {
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	return (
		<ThemeProvider>
			<ProfileContent
				initial={{
					name: me.name,
					sex: me.sex ?? null,
					birthDate: me.birthDate ?? null,
					height: me.height ? Number(me.height) : null,
					weightUnit: me.weightUnit,
					heightUnit: me.heightUnit,
					timezone: me.timezone,
				}}
				entries={entries}
			/>
		</ThemeProvider>
	);
}

type InitialProfile = {
	name: string;
	sex: "male" | "female" | "other" | null;
	birthDate: string | null;
	height: number | null;
	weightUnit: "kg" | "lb";
	heightUnit: "cm" | "ft";
	timezone: string;
};

function ProfileContent({
	initial,
	entries,
}: {
	initial: InitialProfile;
	entries: WeightEntry[];
}) {
	const qc = useQueryClient();
	const { theme, setTheme } = useTheme();

	const [name, setName] = useState<string>(initial.name);
	const [sex, setSex] = useState<"male" | "female" | "other" | "">(
		initial.sex ?? "",
	);
	const [birth, setBirth] = useState<string>(initial.birthDate ?? "");
	const [heightDisplay, setHeightDisplay] = useState<string>(
		initial.height
			? String(
					initial.heightUnit === "ft"
						? Math.round(cmToInches(initial.height))
						: Math.round(initial.height),
				)
			: "",
	);
	const [wUnit, setWUnit] = useState<"kg" | "lb">(initial.weightUnit);
	const [hUnit, setHUnit] = useState<"cm" | "ft">(initial.heightUnit);
	const [tz, setTz] = useState<string>(initial.timezone);

	const saveMutation = useMutation({
		mutationFn: (vars: {
			name?: string;
			sex?: "male" | "female" | "other";
			birthDate?: string;
			height?: number;
			weightUnit: "kg" | "lb";
			heightUnit: "cm" | "ft";
			timezone: string;
		}) => updateProfile({ data: vars }),
		onSuccess: async () => {
			toast.success("Perfil guardado");
			await qc.invalidateQueries({ queryKey: ["current-user"] });
		},
		onError: () => {
			toast.error("No se pudo guardar el perfil");
		},
	});

	const importMutation = useMutation({
		mutationFn: (
			entries: Array<{
				date: string;
				weight: number;
				time?: string | null;
				note?: string | null;
			}>,
		) => importEntries({ data: entries }),
		onSuccess: (res) => {
			toast.success(`${res.inserted} registros importados`);
		},
		onError: () => {
			toast.error("No se pudieron importar los registros");
		},
	});

	const deleteAllMutation = useMutation({
		mutationFn: () => deleteAllMyData(),
		onSuccess: async () => {
			toast.success("Datos eliminados");
			await qc.invalidateQueries({ queryKey: ["current-user"] });
		},
		onError: () => {
			toast.error("No se pudieron eliminar los datos");
		},
	});

	const save = () => {
		const heightCm =
			hUnit === "ft"
				? inchesToCm(parseFloat(heightDisplay) || 0)
				: parseFloat(heightDisplay) || 0;
		saveMutation.mutate({
			name: name || undefined,
			sex: sex || undefined,
			birthDate: birth || undefined,
			height: heightCm || undefined,
			weightUnit: wUnit,
			heightUnit: hUnit,
			timezone: tz,
		});
	};

	const handleImport = (
		data: Array<{
			date: string;
			weight: number;
			time?: string | null;
			note?: string | null;
		}>,
	) => {
		importMutation.mutate(data);
	};

	const handleDeleteAll = () => {
		if (
			!confirm(
				"¿Eliminar todos tus registros? Esta acción no se puede deshacer.",
			)
		) {
			return;
		}
		deleteAllMutation.mutate();
	};

	const handleLogout = async () => {
		await authClient.signOut();
		window.location.assign("/login");
	};

	return (
		<div className="space-y-6">
			<h1 className="font-display text-xl">Perfil</h1>

			<section className="space-y-3">
				<div className="font-display text-sm">Datos personales</div>
				<div className="space-y-3 rounded-2xl bg-card border border-border p-4">
					<Field>
						<Label>Nombre</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-11"
						/>
					</Field>
					<Field>
						<Label>Sexo</Label>
						<Select
							value={sex || undefined}
							onValueChange={(v) => setSex(v as "male" | "female" | "other")}
						>
							<SelectTrigger className="h-11">
								<SelectValue placeholder="Seleccionar" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Masculino</SelectItem>
								<SelectItem value="female">Femenino</SelectItem>
								<SelectItem value="other">Otro</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<Label>Fecha de nacimiento</Label>
						<Input
							type="date"
							value={birth}
							onChange={(e) => setBirth(e.target.value)}
							className="h-11"
						/>
					</Field>
					<div className="grid grid-cols-2 gap-3">
						<Field>
							<Label>Altura ({hUnit === "ft" ? "in" : "cm"})</Label>
							<Input
								type="number"
								value={heightDisplay}
								onChange={(e) => setHeightDisplay(e.target.value)}
								className="h-11"
							/>
						</Field>
						<Field>
							<Label>Unidad altura</Label>
							<Select
								value={hUnit}
								onValueChange={(v) => setHUnit(v as "cm" | "ft")}
							>
								<SelectTrigger className="h-11">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cm">cm</SelectItem>
									<SelectItem value="ft">in</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>
				</div>
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Preferencias</div>
				<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
					<Field>
						<Label>Unidad de peso</Label>
						<Select
							value={wUnit}
							onValueChange={(v) => setWUnit(v as "kg" | "lb")}
						>
							<SelectTrigger className="h-11">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="kg">kg</SelectItem>
								<SelectItem value="lb">lb</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<Label>Zona horaria</Label>
						<Input
							value={tz}
							onChange={(e) => setTz(e.target.value)}
							className="h-11"
						/>
					</Field>
					<Button
						type="button"
						onClick={save}
						disabled={saveMutation.isPending}
						className="w-full h-11 font-display"
					>
						{saveMutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
						Guardar perfil
					</Button>
				</div>
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Apariencia</div>
				<div className="rounded-2xl bg-card border border-border p-4">
					<div className="flex gap-1.5">
						{(
							[
								{ id: "light", l: "Claro" },
								{ id: "dark", l: "Oscuro" },
								{ id: "system", l: "Sistema" },
							] as const
						).map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => setTheme(t.id)}
								className={`flex-1 py-2 rounded-xl text-xs transition-colors ${
									theme === t.id
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{t.l}
							</button>
						))}
					</div>
				</div>
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Datos</div>
				<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
					<ExportImport entries={entries} onImport={handleImport} />
					<Button
						type="button"
						variant="outline"
						onClick={handleDeleteAll}
						disabled={deleteAllMutation.isPending}
						className="w-full h-11 text-destructive"
					>
						{deleteAllMutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
						Eliminar todos mis datos
					</Button>
				</div>
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Más</div>
				<div className="rounded-2xl bg-card border border-border p-2 space-y-1">
					<Link
						to="/goals"
						className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors"
					>
						<TargetIcon className="w-5 h-5 text-primary" />
						<span className="text-sm">Objetivos</span>
					</Link>
					<Link
						to={"/settings" as string}
						className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors"
					>
						<SettingsIcon className="w-5 h-5 text-primary" />
						<span className="text-sm">Configuración</span>
					</Link>
					<Link
						to={"/support" as string}
						className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors"
					>
						<QuestionCircleIcon className="w-5 h-5 text-primary" />
						<span className="text-sm">Soporte</span>
					</Link>
					<Link
						to={"/export" as string}
						className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors"
					>
						<DownloadIcon className="w-5 h-5 text-primary" />
						<span className="text-sm">Exportar datos</span>
					</Link>
					<Link
						to={"/privacy" as string}
						className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors"
					>
						<ShieldIcon className="w-5 h-5 text-primary" />
						<span className="text-sm">Privacidad</span>
					</Link>
				</div>
			</section>

			<Button
				type="button"
				variant="ghost"
				onClick={handleLogout}
				className="w-full h-11"
			>
				Cerrar sesión
			</Button>
		</div>
	);
}
