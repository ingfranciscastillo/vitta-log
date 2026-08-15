import { CloseCircleIcon, HamburgerMenuIcon } from "@solar-icons/react/outline";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export function LandingNavbar() {
	const [open, setOpen] = useState<boolean>(false);
	const { data: session, isPending } = authClient.useSession();
	const signedIn = !isPending && !!session?.user;

	return (
		<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
			<div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full bg-primary" />
					<span className="font-display text-lg">MyWeight</span>
				</Link>
				<nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
					<a
						href="#features"
						className="hover:text-foreground transition-colors"
					>
						Características
					</a>
					{!signedIn && (
						<Link
							to={"/pricing" as string}
							className="hover:text-foreground transition-colors"
						>
							Premium
						</Link>
					)}
					{!signedIn && (
						<Link
							to={"/login" as string}
							className="hover:text-foreground transition-colors"
						>
							Iniciar sesión
						</Link>
					)}
				</nav>
				<div className="flex items-center gap-2">
					{signedIn ? (
						<Button asChild className="hidden sm:inline-flex h-9">
							<Link to={"/dashboard" as string}>Dashboard</Link>
						</Button>
					) : (
						<>
							<Button
								asChild
								variant="ghost"
								className="hidden sm:inline-flex h-9"
							>
								<Link to={"/login" as string}>Iniciar sesión</Link>
							</Button>
							<Button asChild className="hidden sm:inline-flex h-9">
								<Link to={"/register" as string}>Registrarse</Link>
							</Button>
						</>
					)}
					<button
						type="button"
						className="sm:hidden p-2 -mr-2"
						onClick={() => setOpen((o) => !o)}
						aria-label="Menú"
						aria-expanded={open}
					>
						{open ? (
							<CloseCircleIcon className="w-5 h-5" />
						) : (
							<HamburgerMenuIcon className="w-5 h-5" />
						)}
					</button>
				</div>
			</div>
			{open && (
				<div className="sm:hidden border-t border-border bg-background px-4 py-3 space-y-1">
					{/** biome-ignore lint/a11y/useValidAnchor: funciona*/}
					<a
						href="#features"
						onClick={() => setOpen(false)}
						className="block py-2 text-sm"
					>
						Características
					</a>
					{!signedIn && (
						<Link
							to={"/pricing"}
							onClick={() => setOpen(false)}
							className="block py-2 text-sm"
						>
							Premium
						</Link>
					)}
					{signedIn ? (
						<Button asChild className="w-full mt-1">
							<Link to={"/dashboard"}>Dashboard</Link>
						</Button>
					) : (
						<>
							<Link to={"/login"} className="block py-2 text-sm">
								Iniciar sesión
							</Link>
							<Button asChild className="w-full mt-1">
								<Link to={"/register"}>Registrarse</Link>
							</Button>
						</>
					)}
				</div>
			)}
		</header>
	);
}

export default LandingNavbar;
