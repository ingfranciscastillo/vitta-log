import type { HabitLog } from "#/lib/health-types";
import type { WeightEntry } from "#/lib/weight-utils";

export type ActivityMetric = "all" | "weight" | "habits";

export function buildActivityCounts(
	entries: ReadonlyArray<WeightEntry>,
	habits: ReadonlyArray<HabitLog>,
): Record<ActivityMetric, Map<string, number>> {
	const weight = new Map<string, number>();
	const habitsMap = new Map<string, number>();
	const all = new Map<string, number>();

	for (const e of entries) {
		weight.set(e.date, (weight.get(e.date) ?? 0) + 1);
		all.set(e.date, (all.get(e.date) ?? 0) + 1);
	}
	for (const h of habits) {
		habitsMap.set(h.date, (habitsMap.get(h.date) ?? 0) + 1);
		all.set(h.date, (all.get(h.date) ?? 0) + 1);
	}

	return { all, weight, habits: habitsMap };
}
