import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl">Inicio</h1>
			<p className="text-sm text-muted-foreground">Bienvenido.</p>
		</div>
	);
}
