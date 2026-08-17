import { useEffect, useRef, useState } from "react";
import { Skeleton } from "#/components/skeleton";

const APPEAR_DELAY_MS = 200;
const MIN_DISPLAY_MS = 500;

export function DashboardSkeleton() {
	const [visible, setVisible] = useState(false);
	const mountedAt = useRef<number | null>(null);
	const appearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const minDisplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		appearTimer.current = setTimeout(() => {
			mountedAt.current = Date.now();
			setVisible(true);
		}, APPEAR_DELAY_MS);
		return () => {
			if (appearTimer.current) clearTimeout(appearTimer.current);
			if (minDisplayTimer.current) clearTimeout(minDisplayTimer.current);
		};
	}, []);

	useEffect(() => {
		if (!visible) return;
		const remaining =
			MIN_DISPLAY_MS - (Date.now() - (mountedAt.current ?? Date.now()));
		if (remaining <= 0) return;
		minDisplayTimer.current = setTimeout(() => undefined, remaining);
		return () => {
			if (minDisplayTimer.current) clearTimeout(minDisplayTimer.current);
		};
	}, [visible]);

	if (!visible) return null;
	return (
		<div className="space-y-4" aria-busy="true" aria-live="polite">
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
