import type {
	Activity,
	BodyMeasurement,
	Fast,
	HabitLog,
	HealthGoals,
	Meal,
} from "#/lib/health-types";
import {
	calcIMC,
	dateStr,
	sortByDateAsc,
	todayStr,
	type WeightEntry,
} from "#/lib/weight-utils";

const DAY_MS = 86400000;
const MIN_MS = 60000;

export const lastNDateStrings = (n: number, tz?: string): string[] => {
	const out: string[] = [];
	const base = new Date();
	const fmt = tz
		? new Intl.DateTimeFormat("en-CA", {
				timeZone: tz,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
		: null;
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(base.getTime() - i * DAY_MS);
		if (fmt) {
			const parts = fmt.formatToParts(d);
			const y = parts.find((p) => p.type === "year")?.value ?? "";
			const m = parts.find((p) => p.type === "month")?.value ?? "";
			const day = parts.find((p) => p.type === "day")?.value ?? "";
			out.push(`${y}-${m}-${day}`);
		} else {
			out.push(dateStr(d));
		}
	}
	return out;
};

export const daysSince = (dStr: string | null | undefined): number => {
	if (!dStr) return Infinity;
	const t = new Date(`${dStr}T00:00:00`).getTime();
	return Math.floor((Date.now() - t) / DAY_MS);
};

type MacroTotals = {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
};

export const mealTotals = (meals: Meal[], date: string): MacroTotals => {
	const dayMeals = meals.filter((m) => m.date === date);
	return dayMeals.reduce(
		(acc, m) => ({
			calories: acc.calories + (m.calories || 0),
			protein: acc.protein + (m.protein || 0),
			carbs: acc.carbs + (m.carbs || 0),
			fat: acc.fat + (m.fat || 0),
		}),
		{ calories: 0, protein: 0, carbs: 0, fat: 0 },
	);
};

export const mealTotalsRange = (meals: Meal[], dates: string[]): MacroTotals =>
	dates.reduce(
		(acc, d) => {
			const t = mealTotals(meals, d);
			return {
				calories: acc.calories + t.calories,
				protein: acc.protein + t.protein,
				carbs: acc.carbs + t.carbs,
				fat: acc.fat + t.fat,
			};
		},
		{ calories: 0, protein: 0, carbs: 0, fat: 0 },
	);

export const habitValue = (
	habits: HabitLog[],
	type: HabitLog["type"],
	date: string,
): number => {
	const rec = habits.find((h) => h.type === type && h.date === date);
	return rec ? rec.value || 0 : 0;
};

export const habitToday = (
	habits: HabitLog[],
	type: HabitLog["type"],
): number => habitValue(habits, type, todayStr());

export const habitAverage = (
	habits: HabitLog[],
	type: HabitLog["type"],
	days = 7,
): number => {
	const dates = lastNDateStrings(days);
	const vals = dates
		.map((d) => habitValue(habits, type, d))
		.filter((v) => v > 0);
	return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
};

export const habitHistory = (
	habits: HabitLog[],
	type: HabitLog["type"],
	days = 7,
): Array<{ date: string; value: number }> =>
	lastNDateStrings(days).map((d) => ({
		date: d,
		value: habitValue(habits, type, d),
	}));

export type ActivityStats = {
	totalMinutes: number;
	sessions: number;
	topType: string | null;
};

export const activityStats = (
	activities: Activity[],
	days = 7,
): ActivityStats => {
	const dates = new Set(lastNDateStrings(days));
	const week = activities.filter((a) => dates.has(a.date));
	const totalMinutes = week.reduce((s, a) => s + (a.durationMinutes || 0), 0);
	const typeCount: Record<string, number> = {};
	for (const a of week) typeCount[a.type] = (typeCount[a.type] || 0) + 1;
	const topType =
		Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
	return { totalMinutes, sessions: week.length, topType };
};

export type FastStats = {
	completed: number;
	avgDuration: number;
	longest: number;
	active: Fast | undefined;
};

export const fastStats = (fasts: Fast[]): FastStats => {
	const completed = fasts.filter(
		(f) => f.status === "completed" && f.durationMinutes,
	);
	const active = fasts.find((f) => f.status === "active");
	const durations = completed
		.map((f) => f.durationMinutes ?? 0)
		.filter((d) => d > 0);
	return {
		completed: completed.length,
		avgDuration: durations.length
			? durations.reduce((s, d) => s + d, 0) / durations.length
			: 0,
		longest: durations.length ? Math.max(...durations) : 0,
		active,
	};
};

export const fastElapsedMinutes = (fast: Fast | null | undefined): number => {
	if (fast?.status !== "active" || !fast.startedAt) return 0;
	return Math.max(
		0,
		Math.round((Date.now() - new Date(fast.startedAt).getTime()) / MIN_MS),
	);
};

export const imcSeries = (
	entries: WeightEntry[],
	heightCm: number,
): Array<{ date: string; value: number | null }> =>
	sortByDateAsc(entries)
		.map((e) => ({ date: e.date, value: calcIMC(e.weight, heightCm) }))
		.filter((p) => p.value != null);

export const healthyWeightRange = (
	heightCm: number,
): { min: number; max: number } | null => {
	if (!heightCm) return null;
	const m = heightCm / 100;
	return { min: 18.5 * m * m, max: 24.9 * m * m };
};

export const measurementSeries = (
	measurements: BodyMeasurement[],
	type: BodyMeasurement["type"],
): Array<{ date: string; value: number }> =>
	sortByDateAsc(measurements.filter((m) => m.type === type)).map((m) => ({
		date: m.date,
		value: m.value,
	}));

export const latestMeasurement = (
	measurements: BodyMeasurement[],
	type: BodyMeasurement["type"],
): BodyMeasurement | null => {
	const list = measurements.filter((m) => m.type === type);
	if (!list.length) return null;
	return sortByDateAsc(list).pop() ?? null;
};

export type WeeklySummary = {
	weightChange: number | null;
	avgWeight: number | null;
	waterAvg: number;
	stepsAvg: number;
	sleepAvg: number;
	mealTotals7: MacroTotals;
	actStats: ActivityStats;
	fastsCount: number;
	compliance: {
		water: number;
		steps: number;
		sleep: number;
		calories: number;
	};
	dates: string[];
};

export const weeklySummary = (args: {
	entries: WeightEntry[];
	habits: HabitLog[];
	meals: Meal[];
	activities: Activity[];
	fasts: Fast[];
	goals: HealthGoals;
}): WeeklySummary => {
	const { entries, habits, meals, activities, fasts, goals } = args;
	const dates = lastNDateStrings(7);
	const asc = sortByDateAsc(entries);
	const weekEntries = asc.filter((e) => dates.includes(e.date));
	const weightChange =
		weekEntries.length >= 2
			? weekEntries[weekEntries.length - 1].weight - weekEntries[0].weight
			: null;
	const avgWeight = weekEntries.length
		? weekEntries.reduce((s, e) => s + e.weight, 0) / weekEntries.length
		: null;
	const waterAvg = habitAverage(habits, "water", 7);
	const stepsAvg = habitAverage(habits, "steps", 7);
	const sleepAvg = habitAverage(habits, "sleep", 7);
	const mealTotals7 = mealTotalsRange(meals, dates);
	const actStats = activityStats(activities, 7);
	const fastsCount = fasts.filter(
		(f) =>
			f.status === "completed" &&
			f.endedAt &&
			dates.includes(f.endedAt.slice(0, 10)),
	).length;
	const compliance = {
		water: Math.min(1, waterAvg / (goals.water || 1)),
		steps: Math.min(1, stepsAvg / (goals.steps || 1)),
		sleep: Math.min(1, sleepAvg / (goals.sleep || 1)),
		calories: Math.min(1, mealTotals7.calories / 7 / (goals.calories || 1)),
	};
	return {
		weightChange,
		avgWeight,
		waterAvg,
		stepsAvg,
		sleepAvg,
		mealTotals7,
		actStats,
		fastsCount,
		compliance,
		dates,
	};
};

export const dailySuggestion = (args: {
	entries: WeightEntry[];
	habits: HabitLog[];
	meals: Meal[];
	goals: HealthGoals;
}): string => {
	const { entries, habits, meals, goals } = args;
	const asc = sortByDateAsc(entries);
	if (asc.length === 0)
		return "Registra tu primer peso para empezar a ver tu progreso.";
	const water = habitToday(habits, "water");
	const steps = habitToday(habits, "steps");
	const sleepAvg = habitAverage(habits, "sleep", 7);
	const mealsToday = mealTotals(meals, todayStr());
	if (water < (goals.water || 2000) * 0.5)
		return "Llevas poca agua hoy. Un vaso más te ayudará a mantenerte hidratado.";
	if (steps < (goals.steps || 8000) * 0.5)
		return "Aún estás lejos de tu objetivo de pasos. Un paseo corto puede ayudarte a llegar.";
	if (asc.length >= 2) {
		const diff = asc[asc.length - 1].weight - asc[asc.length - 2].weight;
		if (diff < -0.1)
			return "Buen trabajo: tu peso bajó desde el último registro. Sigue con la consistencia.";
		if (diff > 0.3)
			return "Tu peso subió un poco. Las fluctuaciones diarias son normales; fíjate en la tendencia semanal.";
	}
	if (sleepAvg > 0 && sleepAvg < (goals.sleep || 8) - 1)
		return "Tu sueño promedio está por debajo de tu objetivo. Intenta acostarte un poco antes.";
	if (mealsToday.calories > (goals.calories || 2000) * 1.1)
		return "Hoy has superado tu objetivo calórico. Mañana puedes ajustar el ritmo.";
	return "Vas bien. Sigue registrando tus hábitos para mantener la constancia.";
};

export const reminders = (args: {
	entries: WeightEntry[];
	habits: HabitLog[];
	meals: Meal[];
}): string[] => {
	const { entries, habits, meals } = args;
	const out: string[] = [];
	const today = todayStr();
	const asc = sortByDateAsc(entries);
	const lastEntryDate = asc.length ? asc[asc.length - 1].date : null;
	if (!lastEntryDate || daysSince(lastEntryDate) >= 3)
		out.push("Llevas unos días sin registrar tu peso.");
	if (habitValue(habits, "water", today) === 0)
		out.push("Aún no has registrado agua hoy.");
	if (habitValue(habits, "steps", today) === 0)
		out.push("Registra tus pasos de hoy.");
	if (mealTotals(meals, today).calories === 0)
		out.push("Añade tus comidas del día.");
	return out.slice(0, 3);
};

export const metricExplanations = {
	imc: "El IMC relaciona peso y altura como orientación general. No distingue músculo de grasa, así que úsalo como referencia, no como diagnóstico.",
	weightVariation:
		"Tu peso puede variar día a día por hidratación, alimentación, ciclo o momento del día. Lo útil es mirar la tendencia semanal, no un solo valor.",
	weeklyAverage:
		"El promedio semanal suaviza las variaciones diarias y muestra mejor la dirección real de tu progreso.",
	trend:
		"La tendencia resume hacia dónde va tu peso a lo largo del tiempo y es más fiable que comparar solo dos registros.",
	calorieGoal:
		"Tu objetivo calórico es una guía orientativa. Ajustálo según tu actividad y cómo te sientes; no es una prescripción médica.",
	fasting:
		"El ayuno intermitente consiste en alternar periodos sin comer con ventanas de alimentación. La duración ideal varía por persona; consulta a un profesional si tienes dudas.",
};

export const MEASUREMENT_TYPES: Array<{
	id: BodyMeasurement["type"];
	label: string;
	unit: string;
}> = [
	{ id: "waist", label: "Cintura", unit: "cm" },
	{ id: "hip", label: "Cadera", unit: "cm" },
	{ id: "chest", label: "Pecho", unit: "cm" },
	{ id: "arm", label: "Brazos", unit: "cm" },
	{ id: "thigh", label: "Muslos", unit: "cm" },
	{ id: "neck", label: "Cuello", unit: "cm" },
	{ id: "body_fat", label: "% Grasa", unit: "%" },
];

export const HABIT_META: Record<
	HabitLog["type"],
	{ label: string; unit: string; step: number; icon: string }
> = {
	water: { label: "Agua", unit: "ml", step: 250, icon: "Drop" },
	steps: { label: "Pasos", unit: "", step: 500, icon: "Steps" },
	sleep: { label: "Sueño", unit: "h", step: 0.5, icon: "Moon" },
};
