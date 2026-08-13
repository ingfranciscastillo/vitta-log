import {
	CheckCircleIcon,
	MagicWandIcon,
	RestartIcon,
} from "@solar-icons/react/bold";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "#/components/ui/button";
import { createProCheckout } from "#/lib/checkout.functions";

const BENEFITS = [
	"Historial ilimitado de registros",
	"Estadísticas avanzadas y análisis",
	"Tendencias y promedios móviles",
	"IMC y otras métricas de salud",
	"Exportación en CSV, JSON y PDF",
	"Mayor personalización",
	"Recordatorios diarios",
	"Todas las funciones futuras, gratis",
];

export function PaywallContent() {
	const [loading, setLoading] = useState(false);
	const checkout = useServerFn(createProCheckout);

	const handleCheckout = async () => {
		if (typeof window !== "undefined" && window.self !== window.top) {
			toast.error(
				"El pago solo funciona desde la app publicada. Ábrela en una pestaña nueva para comprar.",
			);
			return;
		}
		setLoading(true);
		try {
			const res = await checkout({
				data: {
					successUrl: `${window.location.origin}/pricing/success`,
					cancelUrl: window.location.href,
				},
			});
			if (res.url) {
				window.location.assign(res.url);
				return;
			}
			toast.error("No se pudo iniciar el pago.");
			setLoading(false);
		} catch {
			toast.error("No se pudo iniciar el pago.");
			setLoading(false);
		}
	};

	return (
		<div className="text-center">
			<div className="inline-flex items-center gap-1.5 rounded-full bg-accent/25 text-accent-foreground px-3 py-1 text-xs font-medium mb-4">
				<MagicWandIcon className="w-3.5 h-3.5" /> MyWeight Premium
			</div>
			<h2 className="font-display text-2xl">Desbloquea todo</h2>
			<p className="text-muted-foreground text-sm mt-1">
				Un solo pago. Tuyo para siempre.
			</p>

			<div className="my-5">
				<span className="font-display text-4xl">$12.99</span>
				<span className="text-muted-foreground text-sm"> USD</span>
			</div>

			<ul className="text-left space-y-2.5 mb-6">
				{BENEFITS.map((b) => (
					<li key={b} className="flex items-start gap-2.5 text-sm">
						<span className="mt-0.5 w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
							<CheckCircleIcon className="w-3 h-3" />
						</span>
						<span>{b}</span>
					</li>
				))}
			</ul>

			<Button
				onClick={handleCheckout}
				disabled={loading}
				className="w-full h-12 font-display"
			>
				{loading ? (
					<>
						<RestartIcon className="w-4 h-4 mr-2 animate-spin" /> Procesando...
					</>
				) : (
					"Desbloquear Premium · $12.99"
				)}
			</Button>
			<p className="text-[11px] text-muted-foreground mt-3">
				Pago seguro vía Stripe
			</p>
		</div>
	);
}

export default PaywallContent;
