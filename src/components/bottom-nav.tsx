import {
	CalendarIcon,
	GraphNewIcon,
	HistoryIcon,
	HomeIcon,
	UserIcon,
} from "@solar-icons/react/bold";
import { Link } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";

type SolarIcon = ComponentType<SVGProps<SVGSVGElement>>;

type RoutePath = string;

type NavItem = {
	to: RoutePath;
	label: string;
	icon: SolarIcon;
	end?: boolean;
};

const items: NavItem[] = [
	{ to: "/dashboard", label: "Inicio", icon: HomeIcon, end: true },
	{ to: "/history", label: "Historial", icon: HistoryIcon },
	{ to: "/charts", label: "Gráficos", icon: GraphNewIcon },
	{ to: "/calendar", label: "Calendario", icon: CalendarIcon },
	{ to: "/profile", label: "Perfil", icon: UserIcon },
];

export function BottomNav() {
	return (
		<nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
			<div className="max-w-md mx-auto grid grid-cols-5">
				{items.map(({ to, label, icon: Icon, end }) => (
					<Link
						key={to}
						to={to}
						activeOptions={end ? { exact: true } : undefined}
						activeProps={{
							className:
								"flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors text-primary",
						}}
						inactiveProps={{
							className:
								"flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors text-muted-foreground",
						}}
					>
						<Icon className="w-5 h-5" />
						<span className="font-medium">{label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
}

export default BottomNav;
