import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Toaster
					position="top-center"
					gutter={8}
					toastOptions={{
						duration: 4000,
						className:
							"rounded-xl border border-border bg-card text-card-foreground font-body shadow-sm",
						style: {
							padding: "12px 16px",
							minWidth: "260px",
							maxWidth: "420px",
						},
						success: {
							iconTheme: {
								primary: "hsl(var(--primary))",
								secondary: "hsl(var(--card))",
							},
						},
						error: {
							className:
								"rounded-xl border border-destructive bg-destructive/10 text-destructive font-body shadow-sm",
							iconTheme: {
								primary: "hsl(var(--destructive))",
								secondary: "hsl(var(--card))",
							},
						},
					}}
				/>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
