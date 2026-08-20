import { createFileRoute } from "@tanstack/react-router";
import { currentGoalQuery } from "#/lib/goals";
import { habitLogsQuery } from "#/lib/habits";
import { mealsQuery } from "#/lib/meals";
import { currentUserQuery } from "#/lib/profile";
import { weightStatsQuery } from "#/lib/statistics";
import { weightEntriesQuery } from "#/lib/weight";

export const Route = createFileRoute("/_authenticated/dashboard")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightStatsQuery());
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentGoalQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
		context.queryClient.ensureQueryData(habitLogsQuery());
		context.queryClient.ensureQueryData(mealsQuery());
	},
});
