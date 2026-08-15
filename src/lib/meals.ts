import { queryOptions } from "@tanstack/react-query";
import { listMeals } from "#/lib/meals.functions";

export const mealsQuery = () =>
	queryOptions({
		queryKey: ["meals"] as const,
		queryFn: () => listMeals(),
	});
