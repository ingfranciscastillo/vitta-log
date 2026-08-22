import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { goal, user, weightEntry } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) return null;
		const [profile] = await db
			.select()
			.from(user)
			.where(eq(user.id, session.user.id));
		return profile ?? null;
	},
);

const updateProfileSchema = z.object({
	name: z.string().min(1).max(80).optional(),
	sex: z.enum(["male", "female", "other"]).optional(),
	birthDate: z.string().optional(),
	height: z.number().positive().optional(),
	weightUnit: z.enum(["kg", "lb"]).optional(),
	heightUnit: z.enum(["cm", "ft"]).optional(),
	timezone: z.string().min(1).max(100).optional(),
	tourCompleted: z.boolean().optional(),
	waterGoal: z.number().positive().optional(),
	stepsGoal: z.number().positive().optional(),
	sleepGoal: z.number().positive().optional(),
	calorieGoal: z.number().positive().optional(),
	proteinGoal: z.number().positive().optional(),
	carbsGoal: z.number().positive().optional(),
	fatGoal: z.number().positive().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
	.validator(updateProfileSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const update: Record<string, unknown> = {};
		if (data.name !== undefined) update.name = data.name;
		if (data.sex !== undefined) update.sex = data.sex;
		if (data.birthDate !== undefined) update.birthDate = data.birthDate;
		if (data.height !== undefined) update.height = data.height;
		if (data.weightUnit !== undefined) update.weightUnit = data.weightUnit;
		if (data.heightUnit !== undefined) update.heightUnit = data.heightUnit;
		if (data.timezone !== undefined) update.timezone = data.timezone;
		if (data.tourCompleted !== undefined)
			update.tourCompleted = data.tourCompleted;
		if (data.waterGoal !== undefined)
			update.waterGoal = data.waterGoal.toString();
		if (data.stepsGoal !== undefined)
			update.stepsGoal = data.stepsGoal.toString();
		if (data.sleepGoal !== undefined)
			update.sleepGoal = data.sleepGoal.toString();
		if (data.calorieGoal !== undefined)
			update.calorieGoal = data.calorieGoal.toString();
		if (data.proteinGoal !== undefined)
			update.proteinGoal = data.proteinGoal.toString();
		if (data.carbsGoal !== undefined)
			update.carbsGoal = data.carbsGoal.toString();
		if (data.fatGoal !== undefined) update.fatGoal = data.fatGoal.toString();
		await db.update(user).set(update).where(eq(user.id, session.user.id));
		return { ok: true };
	});

export const deleteAllMyData = createServerFn({ method: "POST" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await db.transaction(async (tx) => {
			await tx
				.delete(weightEntry)
				.where(eq(weightEntry.createdById, session.user.id));
			await tx.delete(goal).where(eq(goal.createdById, session.user.id));
		});
		return { ok: true };
	},
);

const importEntrySchema = z.object({
	date: z.string().min(1),
	weight: z.number().positive(),
	time: z.string().nullable().optional(),
	note: z.string().nullable().optional(),
});

const importSchema = z.array(importEntrySchema);

export const importEntries = createServerFn({ method: "POST" })
	.validator(importSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await db.insert(weightEntry).values(
			data.map((e) => ({
				createdById: session.user.id,
				date: e.date,
				weight: e.weight.toString(),
				time: e.time ?? null,
				note: e.note ?? null,
			})),
		);
		return { inserted: data.length };
	});
