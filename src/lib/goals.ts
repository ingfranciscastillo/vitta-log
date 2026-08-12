import { queryOptions } from "@tanstack/react-query";
import { getCurrentGoal } from "#/lib/goals.functions";

export const currentGoalQuery = () =>
	queryOptions({
		queryKey: ["current-goal"] as const,
		queryFn: () => getCurrentGoal(),
	});
