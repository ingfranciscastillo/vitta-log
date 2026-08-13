import { LockKeyholeIcon, MagicWandIcon } from "@solar-icons/react/bold";
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
			<div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
				<LockKeyholeIcon className="w-6 h-6" />
			</div>
			<div className="inline-flex items-center gap-1.5 rounded-full bg-accent/25 text-accent-foreground px-2.5 py-0.5 text-[11px] font-medium mb-2">
				<MagicWandIcon className="w-3 h-3" /> Premium
			</div>
			<h2 className="font-display text-lg">{title}</h2>
			<p className="text-muted-foreground text-sm mt-1 mb-4 max-w-xs mx-auto">
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
