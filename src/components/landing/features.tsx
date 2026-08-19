import {
	BicyclingIcon,
	BoltIcon,
	CloudIcon,
	GraphNewIcon,
	HistoryIcon,
	MedalRibbonIcon,
	MedalStarIcon,
	RulerIcon,
	StarIcon,
	TargetIcon,
	WalkingIcon,
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
		icon: WalkingIcon,
		title: "Hábitos diarios",
		desc: "Agua, pasos, sueño y ayuno, todo en un tap.",
	},
	{
		icon: BicyclingIcon,
		title: "Nutrición y actividad física",
		desc: "Registra comidas y ejercicio junto a tu peso.",
	},
	{
		icon: RulerIcon,
		title: "Medidas corporales e IMC",
		desc: "Sigue tu composición completa, no solo la balanza.",
	},
	{
		icon: TargetIcon,
		title: "Objetivos diarios",
		desc: "Metas personalizadas para cada hábito, no solo el peso.",
	},
	{
		icon: MedalRibbonIcon,
		title: "Logros y rachas",
		desc: "Desbloquea hitos y mantente motivado con tu constancia.",
	},
	{
		icon: GraphNewIcon,
		title: "Gráficos y estadísticas",
		desc: "Tendencia, media móvil y análisis de tu evolución.",
	},
	{
		icon: HistoryIcon,
		title: "Historial y resumen semanal",
		desc: "Revisa tu semana y tu calendario completo.",
	},
	{
		icon: StarIcon,
		title: "Y mucho más",
		desc: "Seguimos sumando funciones nuevas para ayudarte a alcanzar tus metas.",
	},
];

export function Features() {
	return (
		<section
			id="features"
			className="max-w-5xl mx-auto px-4 py-16 scroll-mt-16"
		>
			<div className="text-center mb-10">
				<h2 className="font-display text-3xl text-balance">
					Todo lo que necesitas
				</h2>
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
							className="rounded-2xl bg-card border border-border p-5"
						>
							<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
								<Icon className="w-5 h-5" />
							</div>
							<h3 className="font-display text-base mb-1">{f.title}</h3>
							<p className="text-sm text-muted-foreground text-pretty">
								{f.desc}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}

export default Features;
