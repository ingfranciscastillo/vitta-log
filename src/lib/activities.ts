import { queryOptions } from "@tanstack/react-query";
import { listActivities } from "#/lib/activities.functions";

export const activitiesQuery = () =>
	queryOptions({
		queryKey: ["activities"] as const,
		queryFn: () => listActivities(),
	});
