import { createFileRoute } from "@tanstack/react-router";
import Features from "#/components/landing/features";
import Hero from "#/components/landing/hero";
import LandingFooter from "#/components/landing/landing-footer";
import LandingNavbar from "#/components/landing/landing-navbar";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
	return (
		<div className="min-h-screen bg-background">
			<LandingNavbar />
			<main>
				<Hero />
				<Features />
			</main>
			<LandingFooter />
		</div>
	);
}
