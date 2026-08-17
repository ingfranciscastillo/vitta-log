import {
	CalendarDateIcon,
	CalendarIcon,
	ChartSquareIcon,
	CrownIcon,
	DownloadIcon,
	DumbbellIcon,
	HealthIcon,
	HistoryIcon,
	LightbulbIcon,
	MedalRibbonIcon,
	PlateIcon,
	RulerIcon,
	SettingsMinimalisticIcon,
	StopwatchIcon,
	TargetIcon,
} from "@solar-icons/react/outline";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/more")({
	component: MorePage,
});

const LINKS: Array<{
	to:
		| "/goals"
		| "/measurements"
		| "/imc"
		| "/nutrition"
		| "/fasting"
		| "/activity"
		| "/insights"
		| "/weekly-summary"
		| "/history"
		| "/charts"
		| "/calendar"
		| "/statistics"
		| "/achievements"
		| "/profile"
		| "/export"
		| "/pricing";
	label: string;
	icon: typeof TargetIcon;
}> = [
	{ to: "/goals", label: "Objetivos", icon: TargetIcon },
	{ to: "/measurements", label: "Medidas", icon: RulerIcon },
	{ to: "/imc", label: "IMC", icon: HealthIcon },
	{ to: "/nutrition", label: "Nutrición", icon: PlateIcon },
	{ to: "/fasting", label: "Ayuno", icon: StopwatchIcon },
	{ to: "/activity", label: "Actividad", icon: DumbbellIcon },
	{ to: "/insights", label: "Recomendaciones", icon: LightbulbIcon },
	{ to: "/weekly-summary", label: "Resumen semanal", icon: CalendarDateIcon },
	{ to: "/history", label: "Historial", icon: HistoryIcon },
	{ to: "/charts", label: "Gráficos", icon: ChartSquareIcon },
	{ to: "/calendar", label: "Calendario", icon: CalendarIcon },
	{ to: "/statistics", label: "Estadísticas", icon: ChartSquareIcon },
	{ to: "/achievements", label: "Logros", icon: MedalRibbonIcon },
	{ to: "/profile", label: "Ajustes", icon: SettingsMinimalisticIcon },
	{ to: "/export", label: "Exportar", icon: DownloadIcon },
	{ to: "/pricing", label: "Premium", icon: CrownIcon },
];

function MorePage() {
	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Más</h1>
			<div className="grid grid-cols-3 gap-3">
				{LINKS.map((l) => {
					const Icon = l.icon;
					return (
						<Link
							key={l.to}
							to={l.to}
							className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-2 hover:bg-muted transition-colors"
						>
							<Icon className="w-5 h-5 text-primary" />
							<span className="text-xs text-center font-display">
								{l.label}
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
