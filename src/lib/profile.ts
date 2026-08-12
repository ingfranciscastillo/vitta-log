import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "#/lib/profile.functions";

export const currentUserQuery = () =>
	queryOptions({
		queryKey: ["current-user"] as const,
		queryFn: () => getCurrentUser(),
	});
