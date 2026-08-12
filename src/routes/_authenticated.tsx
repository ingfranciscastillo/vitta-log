import { AddCircleIcon } from "@solar-icons/react/bold";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { BottomNav } from "#/components/bottom-nav";
import { QuickLogDialog } from "#/components/quick-log-dialog";
import { getSession } from "#/lib/auth.functions";
import { weightStatsQuery } from "#/lib/statistics";
import { weightEntriesQuery } from "#/lib/weight";
import { createWeightEntry } from "#/lib/weight.functions";

type SavePayload = {
	weight: number;
	date: string;
	time: string;
	note?: string;
};

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ location }) => {
		const session = await getSession();

		if (!session) {
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}

		return { user: session.user };
	},
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(weightStatsQuery());
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const [quickOpen, setQuickOpen] = useState(false);
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const { unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const qc = useQueryClient();

	const saveMut = useMutation({
		mutationFn: (payload: SavePayload) =>
			createWeightEntry({
				data: {
					weight: payload.weight,
					date: payload.date,
					time: payload.time,
					note: payload.note ?? null,
				},
			}),
		onSuccess: async () => {
			toast.success("Peso registrado");
			setQuickOpen(false);
			await qc.invalidateQueries({ queryKey: ["weight-entries"] });
			await qc.invalidateQueries({ queryKey: ["weight-stats"] });
		},
		onError: () => {
			toast.error("No se pudo registrar el peso");
		},
	});

	const handleSave = (payload: SavePayload): void => {
		saveMut.mutate(payload);
	};

	const handleRepeat = (payload: SavePayload): void => {
		saveMut.mutate(payload);
	};

	return (
		<div className="min-h-screen bg-background max-w-md mx-auto relative">
			<header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
				<div className="flex items-center justify-between px-4 h-14">
					<div className="flex items-center gap-2">
						<span className="w-2.5 h-2.5 rounded-full bg-primary" />
						<span className="font-display text-base">MyWeight</span>
						{saveMut.isPending && (
							<span className="text-[10px] text-muted-foreground">
								Guardando...
							</span>
						)}
					</div>
					<button
						type="button"
						onClick={() => setQuickOpen(true)}
						className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-95 transition-transform"
						aria-label="Registrar peso"
					>
						<AddCircleIcon className="w-5 h-5" />
					</button>
				</div>
			</header>
			<main className="px-4 pt-4 pb-28">
				<Outlet />
			</main>
			<BottomNav />
			<QuickLogDialog
				open={quickOpen}
				onOpenChange={setQuickOpen}
				lastWeightKg={entries[0]?.weight ?? null}
				unit={unit}
				onSave={handleSave}
				onRepeat={handleRepeat}
			/>
		</div>
	);
}
