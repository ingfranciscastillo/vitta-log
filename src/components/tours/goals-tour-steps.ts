import type { TourStepConfig } from "#/components/tour-runner";

export const GOALS_TOUR_STEPS: ReadonlyArray<TourStepConfig> = [
	{
		target: '[data-tour="goal-habits"]',
		title: "Hábitos diarios",
		description:
			"Ajusta cuánta agua, pasos y horas de sueño quieres alcanzar cada día.",
		side: "bottom",
		align: "center",
	},
	{
		target: '[data-tour="goal-nutrition"]',
		title: "Objetivos nutricionales",
		description: "Personaliza tus calorías y macros diarias.",
		side: "top",
		align: "center",
	},
	{
		target: '[data-tour="goal-weight"]',
		title: "Objetivo de peso",
		description:
			"Define tu meta de peso, fecha objetivo y el ritmo al que quieres llegar.",
		side: "top",
		align: "center",
	},
];
