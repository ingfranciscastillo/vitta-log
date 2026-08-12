import { FireIcon, MedalRibbonIcon } from "@solar-icons/react/bold";

type StreakCardProps = {
	current: number;
	best: number;
};

export function StreakCard({ current, best }: StreakCardProps) {
	return (
		<div className="grid grid-cols-2 gap-3">
			<div className="rounded-2xl bg-card border border-border p-4 text-center">
				<FireIcon className="w-5 h-5 mx-auto text-amber-500" />
				<div className="font-display text-2xl mt-1">{current}</div>
				<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
					Racha actual
				</div>
			</div>
			<div className="rounded-2xl bg-card border border-border p-4 text-center">
				<MedalRibbonIcon className="w-5 h-5 mx-auto text-primary" />
				<div className="font-display text-2xl mt-1">{best}</div>
				<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
					Mejor racha
				</div>
			</div>
		</div>
	);
}

export default StreakCard;
