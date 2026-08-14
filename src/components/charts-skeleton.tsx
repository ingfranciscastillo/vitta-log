import { Skeleton } from "#/components/skeleton";

export function ChartsSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-64 rounded-2xl" />
		</div>
	);
}

export default ChartsSkeleton;
