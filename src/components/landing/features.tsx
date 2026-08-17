import {
	BoltIcon,
	CalendarMarkIcon,
	CloudIcon,
	GraphNewIcon,
	StarIcon,
	TargetIcon,
} from "@solar-icons/react/outline";
import type { ComponentType, SVGProps } from "react";

type SolarIcon = ComponentType<SVGProps<SVGSVGElement>>;

type Feature = {
	icon: SolarIcon;
	title: string;
	desc: string;
};

const features: Feature[] = [
	{
		icon: BoltIcon,
		title: "Registro ultra rápido",
		desc: "Abre, pesa, guarda. En menos de 5 segundos, sin fricción.",
	},
	{
		icon: GraphNewIcon,
		title: "Gráficos interactivos",
		desc: "Visualiza tu evolución con tendencia, media móvil y línea de meta.",
	},
	{
		icon: TargetIcon,
		title: "Metas y progreso",
		desc: "Define tu objetivo y sigue tu avance con estimaciones de llegada.",
	},
	{
		icon: CalendarMarkIcon,
		title: "Calendario visual",
		desc: "Vista mensual con colores según si bajaste o subiste cada día.",
	},
	{
		icon: StarIcon,
		title: "Insights automáticos",
		desc: "Análisis de tu tendencia, rachas y progreso generados para ti.",
	},
	{
		icon: CloudIcon,
		title: "Funciona offline",
		desc: "Registra sin conexión; se sincroniza automáticamente al volver.",
	},
];

export function Features() {
	return (
		<section
			id="features"
			className="max-w-5xl mx-auto px-4 py-16 scroll-mt-16"
		>
			<div className="text-center mb-10">
				<h2 className="font-display text-3xl text-balance">Todo lo que necesitas</h2>
				<p className="text-muted-foreground mt-2">
					Simple de usar, potente en análisis.
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{features.map((f) => {
					const Icon = f.icon;
					return (
						<div
							key={f.title}
							className="rounded-2xl bg-card border border-border p-5 hover:shadow-sm transition-shadow"
						>
							<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
								<Icon className="w-5 h-5" />
							</div>
							<h3 className="font-display text-base mb-1">{f.title}</h3>
							<p className="text-sm text-muted-foreground text-pretty">{f.desc}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}

export default Features;
