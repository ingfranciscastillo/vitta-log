import { Link } from "@tanstack/react-router";

export function LandingFooter() {
	return (
		<footer className="border-t border-border mt-8">
			<div className="max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full bg-primary" />
					<span className="font-display text-base">MyWeight</span>
				</div>
				<nav className="flex items-center gap-5 text-sm text-muted-foreground">
					<a
						href="#features"
						className="hover:text-foreground transition-colors"
					>
						Características
					</a>
					<Link
						to={"/login" as string}
						className="hover:text-foreground transition-colors"
					>
						Iniciar sesión
					</Link>
					<Link
						to={"/register" as string}
						className="hover:text-foreground transition-colors"
					>
						Registrarse
					</Link>
				</nav>
				<p className="text-xs text-muted-foreground">
					© {new Date().getFullYear()} MyWeight
				</p>
			</div>
		</footer>
	);
}

export default LandingFooter;
