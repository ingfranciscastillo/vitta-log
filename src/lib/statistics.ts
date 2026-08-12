import { queryOptions } from "@tanstack/react-query";
import { getWeightStats } from "#/lib/statistics.functions";
import type { WeightEntry, WeightUnit } from "#/lib/weight-utils";

type WeightStatsResponse = {
	entries: WeightEntry[];
	unit: WeightUnit;
};

async function fetchWeightStats(): Promise<WeightStatsResponse> {
	return (await getWeightStats()) as unknown as WeightStatsResponse;
}

export const weightStatsQuery = () =>
	queryOptions({
		queryKey: ["weight-stats"] as const,
		queryFn: fetchWeightStats,
	});
