import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { db } from "#/db";
import { user, weightEntry } from "#/db/schema";
import { ensureSession } from "#/lib/auth.functions";
import type { WeightEntry, WeightUnit } from "#/lib/weight-utils";

type WeightStatsResponse = {
	entries: WeightEntry[];
	unit: WeightUnit;
};

export const getWeightStats = createServerFn({ method: "GET" }).handler(
	async (): Promise<WeightStatsResponse> => {
		const session = await ensureSession();
		const rows = await db
			.select()
			.from(weightEntry)
			.where(eq(weightEntry.createdById, session.user.id))
			.orderBy(asc(weightEntry.date));
		const [profile] = await db
			.select({ weightUnit: user.weightUnit })
			.from(user)
			.where(eq(user.id, session.user.id));
		const entries: WeightEntry[] = rows.map((r) => ({
			id: r.id,
			createdById: r.createdById,
			date: r.date,
			weight: Number(r.weight),
			time: r.time,
			note: r.note,
		}));
		return {
			entries,
			unit: (profile?.weightUnit ?? "kg") as WeightUnit,
		};
	},
);
