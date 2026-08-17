import { ArrowRightIcon, BoltIcon } from "@solar-icons/react/outline";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

export function Hero() {
	return (
		<section className="relative overflow-hidden">
			<div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
			<div className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center relative">
				<div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-6">
					<BoltIcon className="w-3.5 h-3.5" /> Registro en 5 segundos
				</div>
				<h1 className="font-display text-4xl sm:text-6xl leading-tight text-balance">
					Tu peso,
					<br />
					<span className="text-primary">día a día</span>
				</h1>
				<p className="mt-5 text-muted-foreground text-lg max-w-md mx-auto text-pretty">
					La forma más simple y rápida de registrar tu peso, ver tu evolución y
					alcanzar tus metas.
				</p>
				<div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
					<Button asChild size="lg" className="h-12 px-6 font-display">
						<Link to={"/register" as string}>
							Registrarse gratis <ArrowRightIcon className="w-4 h-4 ml-1.5" />
						</Link>
					</Button>
					<Button asChild variant="outline" size="lg" className="h-12 px-6">
						<Link to={"/login" as string}>Iniciar sesión</Link>
					</Button>
				</div>

				<div className="mt-14 mx-auto max-w-sm">
					<div className="rounded-3xl bg-primary text-primary-foreground p-6 text-left shadow-xl">
						<div className="text-[11px] uppercase opacity-70">Peso actual</div>
						<div className="flex items-baseline gap-2 mt-1">
							<span className="font-display text-5xl leading-none tabular-nums">
								72.4
							</span>
							<span className="font-display text-lg opacity-70">kg</span>
						</div>
						<div className="flex items-center gap-1.5 mt-3 text-sm opacity-90">
							−0.4 kg vs último registro
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Hero;
