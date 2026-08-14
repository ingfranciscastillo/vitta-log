import { Skeleton } from "#/components/skeleton";

export function HistorySkeleton() {
	return (
		<div className="space-y-3">
			<Skeleton className="h-10 rounded-md w-full" />
			{Array.from({ length: 6 }, () => (
				<Skeleton
					key={crypto.randomUUID()}
					className="h-12 rounded-md w-full"
				/>
			))}
		</div>
	);
}

export default HistorySkeleton;
