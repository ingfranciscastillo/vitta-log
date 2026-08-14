type ProgressBarProps = {
	value: number;
	goal: number;
	className?: string;
};

export function ProgressBar({ value, goal, className = "" }: ProgressBarProps) {
	const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
	return (
		<div className={`h-2 rounded-full bg-muted overflow-hidden ${className}`}>
			<div
				className="h-full rounded-full bg-primary transition-all"
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

export default ProgressBar;
