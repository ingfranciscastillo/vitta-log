import { queryOptions } from "@tanstack/react-query";
import { listFasts } from "#/lib/fasts.functions";

export const fastsQuery = () =>
	queryOptions({
		queryKey: ["fasts"] as const,
		queryFn: () => listFasts(),
	});
