import { queryOptions } from "@tanstack/react-query";
import { listHabitLogs } from "#/lib/habits.functions";

export const habitLogsQuery = () =>
	queryOptions({
		queryKey: ["habit-logs"] as const,
		queryFn: () => listHabitLogs(),
	});
