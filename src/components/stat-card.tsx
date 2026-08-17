import type { ComponentType, ReactNode, SVGProps } from "react";

type SolarIcon = ComponentType<SVGProps<SVGSVGElement>>;

type StatCardProps = {
	label: ReactNode;
	value: ReactNode;
	sub?: ReactNode;
	icon?: SolarIcon;
	accent?: string;
};

export function StatCard({
	label,
	value,
	sub,
	icon: Icon,
	accent,
}: StatCardProps) {
	return (
		<div className="rounded-2xl bg-card border border-border p-4">
			<div className="flex items-center justify-between">
				<span className="text-[10px] font-medium uppercase text-muted-foreground">
					{label}
				</span>
				{Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
			</div>
			<div
				className={`mt-2 font-display text-2xl leading-none tabular-nums ${accent ?? ""}`}
			>
				{value}
			</div>
			{sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
		</div>
	);
}

export default StatCard;
