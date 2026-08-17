import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

type EmptyStateAction =
	| { label: string; onClick: () => void }
	| { label: string; href: string };

type EmptyStateProps = {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: EmptyStateAction;
	className?: string;
};

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center text-center gap-2 py-8 px-4",
				className,
			)}
		>
			{icon ? (
				<div
					aria-hidden="true"
					className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-6"
				>
					{icon}
				</div>
			) : null}
			<p className="font-display text-sm text-balance">{title}</p>
			{description ? (
				<p className="text-xs text-muted-foreground text-pretty max-w-xs">
					{description}
				</p>
			) : null}
			{action ? (
				"onClick" in action ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={action.onClick}
						className="mt-2"
					>
						{action.label}
					</Button>
				) : (
					<Button asChild variant="outline" size="sm" className="mt-2">
						<Link to={action.href}>{action.label}</Link>
					</Button>
				)
			) : null}
		</div>
	);
}

export default EmptyState;
