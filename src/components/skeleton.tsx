import { cn } from "#/lib/utils.ts";

function Skeleton({ className, style, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("bg-muted rounded-md", className)}
			style={{
				animationName: "loading-ui-skeleton-pulse",
				animationDuration: "1.8s",
				animationTimingFunction: "ease-in-out",
				animationIterationCount: "infinite",
				...style,
			}}
			{...props}
		/>
	);
}

export { Skeleton };
