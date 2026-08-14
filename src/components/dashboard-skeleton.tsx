import { Skeleton } from "#/components/skeleton";

export function DashboardSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-32 rounded-3xl" />
			<div className="grid grid-cols-2 gap-3">
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-20 rounded-2xl" />
				<Skeleton className="h-20 rounded-2xl" />
			</div>
		</div>
	);
}

export default DashboardSkeleton;
