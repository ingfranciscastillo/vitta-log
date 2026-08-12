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
	weightUnit: z.enum(["kg", "lb"]),
	heightUnit: z.enum(["cm", "ft"]),
	timezone: z.string().min(1).max(100),
});

export const updateProfile = createServerFn({ method: "POST" })
	.validator(updateProfileSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const { weightUnit, heightUnit, timezone, ...rest } = data;
		const update: Record<string, unknown> = {
			weightUnit,
			heightUnit,
			timezone,
		};
		if (rest.name !== undefined) update.name = rest.name;
		if (rest.sex !== undefined) update.sex = rest.sex;
		if (rest.birthDate !== undefined) update.birthDate = rest.birthDate;
		if (rest.height !== undefined) update.height = rest.height;
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
