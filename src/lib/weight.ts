import { queryOptions } from "@tanstack/react-query";
import { listWeightEntries } from "#/lib/weight.functions";

export const weightEntriesQuery = () =>
	queryOptions({
		queryKey: ["weight-entries"] as const,
		queryFn: () => listWeightEntries(),
	});
