import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AchievementsList } from "#/components/achievements-list";
import { StreakCard } from "#/components/streak-card";
import { currentGoalQuery } from "#/lib/goals";
import { weightEntriesQuery } from "#/lib/weight";
import { computeAchievements, computeStreaks } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/achievements")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentGoalQuery());
	},
	component: AchievementsPage,
});

function AchievementsPage() {
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const { goal, unit } = useSuspenseQuery(currentGoalQuery()).data!;

	const achievements = useMemo(
		() => computeAchievements(entries, goal, unit),
		[entries, goal, unit],
	);
	const streaks = useMemo(() => computeStreaks(entries), [entries]);

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Logros y rachas</h1>
			<StreakCard current={streaks.current} best={streaks.best} />
			<div>
				<div className="font-display text-sm mb-2">Logros</div>
				<AchievementsList achievements={achievements} />
			</div>
		</div>
	);
}
