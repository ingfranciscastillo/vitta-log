import { ArrowLeftIcon } from "@solar-icons/react/bold";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PaywallContent } from "#/components/paywall-content";

export const Route = createFileRoute("/_authenticated/pricing/")({
	component: PricingPage,
});

function PricingPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="w-full max-w-sm">
				<Link
					to="/dashboard"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
				>
					<ArrowLeftIcon className="w-4 h-4" /> Volver
				</Link>
				<div className="rounded-3xl bg-card border border-border p-6">
					<PaywallContent />
				</div>
			</div>
		</div>
	);
}
