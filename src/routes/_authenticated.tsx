import { AddCircleIcon } from "@solar-icons/react/line-duotone";
import {
	MoonIcon,
	ScaleIcon,
	WalkingIcon,
	WaterdropIcon,
} from "@solar-icons/react/outline";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { BottomNav } from "#/components/bottom-nav";
import { DashboardSkeleton } from "#/components/dashboard-skeleton";
import { HabitLogDialog } from "#/components/habit-log-dialog";
import { QuickLogContext } from "#/components/quick-log-context";
import { QuickLogDialog } from "#/components/quick-log-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { getSession } from "#/lib/auth.functions";
import { habitLogsQuery } from "#/lib/habits";
import { addHabitLog } from "#/lib/habits.functions";
import { habitToday } from "#/lib/health-utils";
import { weightStatsQuery } from "#/lib/statistics";
import { weightEntriesQuery } from "#/lib/weight";
import { createWeightEntry } from "#/lib/weight.functions";
import { todayStr } from "#/lib/weight-utils";

type SavePayload = {
	weight: number;
	date: string;
	time: string;
	note?: string;
};

type HabitType = "water" | "steps" | "sleep";

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
		context.queryClient.ensureQueryData(habitLogsQuery());
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const [quickOpen, setQuickOpen] = useState<boolean>(false);
	const [habitOpen, setHabitOpen] = useState<boolean>(false);
	const [habitType, setHabitType] = useState<HabitType>("water");
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const { unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const habits = useSuspenseQuery(habitLogsQuery()).data!;
	const qc = useQueryClient();

	const today = todayStr();
	const currentToday = habitToday(habits, habitType);

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

	const addHabitMut = useMutation({
		mutationFn: (vars: { type: HabitType; step: number }) =>
			addHabitLog({
				data: { type: vars.type, date: today, step: vars.step },
			}),
		onSuccess: async () => {
			toast.success("Hábito registrado");
			setHabitOpen(false);
			await qc.invalidateQueries({ queryKey: ["habit-logs"] });
		},
		onError: () => {
			toast.error("No se pudo registrar el hábito");
		},
	});

	const handleSave = (payload: SavePayload): void => {
		saveMut.mutate(payload);
	};

	const handleRepeat = (payload: SavePayload): void => {
		saveMut.mutate(payload);
	};

	const openHabit = (type: HabitType) => {
		setHabitType(type);
		setHabitOpen(true);
	};

	return (
		<QuickLogContext.Provider value={{ open: () => setQuickOpen(true) }}>
			<div className="min-h-dvh bg-background max-w-md mx-auto relative">
				<header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border pt-[env(safe-area-inset-top)]">
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
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-95 transition-transform"
									aria-label="Registrar"
								>
									<AddCircleIcon
										secondaryOpacity={0}
										size={50}
										className="size-5"
									/>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="rounded-2xl min-w-40 p-1.5"
							>
								<DropdownMenuItem
									onSelect={() => setQuickOpen(true)}
									className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
								>
									<ScaleIcon className="w-4 h-4 text-primary" />
									<span className="text-sm">Peso</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => openHabit("water")}
									className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
								>
									<WaterdropIcon className="w-4 h-4 text-primary" />
									<span className="text-sm">Agua</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => openHabit("steps")}
									className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
								>
									<WalkingIcon className="w-4 h-4 text-primary" />
									<span className="text-sm">Pasos</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => openHabit("sleep")}
									className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
								>
									<MoonIcon className="w-4 h-4 text-primary" />
									<span className="text-sm">Sueño</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>
				<main className="px-4 pt-4 pb-28">
					<Suspense fallback={<DashboardSkeleton />}>
						<Outlet />
					</Suspense>
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
				<HabitLogDialog
					open={habitOpen}
					onOpenChange={setHabitOpen}
					type={habitType}
					currentToday={currentToday}
					onSave={(type, value) => addHabitMut.mutate({ type, step: value })}
				/>
			</div>
		</QuickLogContext.Provider>
	);
}
