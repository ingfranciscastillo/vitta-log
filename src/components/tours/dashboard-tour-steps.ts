import type { TourStepConfig } from "#/components/tour-runner";

export const DASHBOARD_TOUR_STEPS: ReadonlyArray<TourStepConfig> = [
	{
		target: '[data-tour="brand"]',
		title: "Bienvenido a Vitta",
		description: "Tu app personal de salud...",
		side: "bottom",
		align: "start",
	},
	{
		target: '[data-tour="quick-log"]',
		title: "Registra en segundos",
		description: "Toca el botón + para registrar peso, agua, pasos o sueño.",
		side: "bottom",
		align: "end",
	},
	{
		target: '[data-tour="goal-section"]',
		title: "Define tu objetivo",
		description: "Fija una meta de peso y sigue tu progreso hacia ella.",
		side: "top",
		align: "center",
	},
	{
		target: '[data-tour="water-counter"]',
		title: "Agua diaria",
		description: "Registra cuánta agua tomas y mantente hidratado.",
		side: "top",
		align: "center",
	},
	{
		target: '[data-tour="habits"]',
		title: "Hábitos de hoy",
		description: "Lleva el control de tus pasos y horas de sueño con un toque.",
		side: "top",
		align: "center",
	},
	{
		target: '[data-tour="suggestions"]',
		title: "Sugerencias para ti",
		description: "Cada día Vitta te sugiere qué registrar según tus datos.",
		side: "top",
		align: "center",
	},
	{
		target: '[data-tour="bottom-nav"]',
		title: "Todo en un lugar",
		description:
			"Aquí encuentras gráficos, ayuno, insights, perfil y configuración.",
		side: "top",
		align: "center",
	},
	{
		target: '[data-tour="settings-link"]',
		title: "Configura tu perfil",
		description: "Desde tu perfil puedes cambiar unidades, zona horaria y más.",
		side: "top",
		align: "end",
	},
];
