import { StarsMinimalisticIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import { PaywallDialog } from "#/components/paywall-dialog";
import { Button } from "#/components/ui/button";

type PremiumGateProps = {
	title?: string;
	description?: string;
};

export function PremiumGate({
	title = "Función Premium",
	description = "Desbloquea esta y todas las funciones avanzadas con un solo pago.",
}: PremiumGateProps) {
	const [open, setOpen] = useState(false);
	return (
		<div className="rounded-2xl border border-dashed border-border p-8 text-center">
			<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
				<StarsMinimalisticIcon className="w-6 h-6" />
			</div>
			<h2 className="font-display text-lg text-balance">{title}</h2>
			<p className="text-muted-foreground text-sm mt-1 mb-4 max-w-xs mx-auto text-pretty">
				{description}
			</p>
			<Button onClick={() => setOpen(true)} className="h-11 font-display">
				Desbloquear Premium · $12.99
			</Button>
			<PaywallDialog open={open} onOpenChange={setOpen} />
		</div>
	);
}

export default PremiumGate;
