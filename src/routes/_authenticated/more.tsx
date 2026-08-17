import {
	CalendarDateIcon,
	CalendarIcon,
	ChartSquareIcon,
	CrownMinimalisticIcon,
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

type LinkItem = {
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
	featured?: boolean;
};

type Section = {
	title: string;
	items: LinkItem[];
};

const SECTIONS: Section[] = [
	{
		title: "Salud",
		items: [
			{ to: "/goals", label: "Objetivos", icon: TargetIcon },
			{ to: "/measurements", label: "Medidas", icon: RulerIcon },
			{ to: "/imc", label: "IMC", icon: HealthIcon },
			{ to: "/nutrition", label: "Nutrición", icon: PlateIcon },
			{ to: "/fasting", label: "Ayuno", icon: StopwatchIcon },
			{ to: "/activity", label: "Actividad", icon: DumbbellIcon },
		],
	},
	{
		title: "Seguimiento",
		items: [
			{ to: "/insights", label: "Recomendaciones", icon: LightbulbIcon },
			{
				to: "/weekly-summary",
				label: "Resumen semanal",
				icon: CalendarDateIcon,
			},
			{ to: "/history", label: "Historial", icon: HistoryIcon },
			{ to: "/charts", label: "Gráficos", icon: ChartSquareIcon },
			{ to: "/calendar", label: "Calendario", icon: CalendarIcon },
			{ to: "/statistics", label: "Estadísticas", icon: ChartSquareIcon },
		],
	},
	{
		title: "Cuenta",
		items: [
			{ to: "/achievements", label: "Logros", icon: MedalRibbonIcon },
			{ to: "/profile", label: "Ajustes", icon: SettingsMinimalisticIcon },
			{ to: "/export", label: "Exportar", icon: DownloadIcon },
			{
				to: "/pricing",
				label: "Premium",
				icon: CrownMinimalisticIcon,
				featured: true,
			},
		],
	},
];

function MorePage() {
	return (
		<div className="space-y-6">
			<h1 className="font-display text-xl text-balance">Más</h1>

			{SECTIONS.map((section, sectionIdx) => (
				<section key={section.title} className="space-y-3">
					<h2 className="font-display text-sm text-balance">{section.title}</h2>
					<div className="grid grid-cols-3 gap-3">
						{section.items.map((item, itemIdx) => {
							const Icon = item.icon;
							const delay = (sectionIdx * 6 + itemIdx) * 30;
							return (
								<Link
									key={item.to}
									to={item.to}
									style={{ animationDelay: `${delay}ms` }}
									className={
										item.featured
											? "group relative rounded-2xl border border-accent/40 bg-accent/15 p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:bg-accent/25 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
											: "group relative rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:bg-muted/50 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
									}
								>
									<Icon
										className={
											item.featured
												? "size-6 text-accent-foreground transition-transform group-hover:scale-110 group-hover:rotate-3"
												: "size-6 text-primary transition-transform group-hover:scale-110 group-hover:rotate-3"
										}
									/>
									<span className="text-xs text-center font-display wrap-break-word hyphens-auto">
										{item.label}
									</span>
								</Link>
							);
						})}
					</div>
				</section>
			))}
		</div>
	);
}
