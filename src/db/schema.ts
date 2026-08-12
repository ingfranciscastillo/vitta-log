import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	time,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "user"]);
export const sex = pgEnum("sex", ["male", "female", "other"]);
export const weightUnit = pgEnum("weight_unit", ["kg", "lb"]);
export const heightUnit = pgEnum("height_unit", ["cm", "ft"]);
export const goalPace = pgEnum("goal_pace", ["slow", "moderate", "fast"]);
export const supportStatus = pgEnum("support_status", [
	"open",
	"in_progress",
	"resolved",
	"closed",
]);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: userRole("role").default("user").notNull(),
	sex: sex("sex"),
	birthDate: date("birth_date"),
	height: numeric("height", { precision: 6, scale: 2 }),
	weightUnit: weightUnit("weight_unit").default("kg").notNull(),
	heightUnit: heightUnit("height_unit").default("cm").notNull(),
	timezone: text("timezone").default("UTC").notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	isPro: boolean("is_pro").default(false).notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const goal = pgTable(
	"goal",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		targetWeight: numeric("target_weight", {
			precision: 6,
			scale: 2,
		}).notNull(),
		targetDate: date("target_date"),
		pace: goalPace("pace").default("moderate").notNull(),
		startWeight: numeric("start_weight", { precision: 6, scale: 2 }),
		startDate: date("start_date"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("goal_created_by_id_idx").on(table.createdById)],
);

export const weightEntry = pgTable(
	"weight_entry",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		weight: numeric("weight", { precision: 6, scale: 2 }).notNull(),
		date: date("date").notNull(),
		time: time("time"),
		note: text("note"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("weight_entry_created_by_id_idx").on(table.createdById),
		index("weight_entry_date_idx").on(table.date),
	],
);

export const supportTicket = pgTable(
	"support_ticket",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subject: text("subject").notNull(),
		message: text("message").notNull(),
		status: supportStatus("status").default("open").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("support_ticket_created_by_id_idx").on(table.createdById),
		index("support_ticket_status_idx").on(table.status),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	goals: many(goal),
	weightEntries: many(weightEntry),
	supportTickets: many(supportTicket),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const goalRelations = relations(goal, ({ one }) => ({
	user: one(user, {
		fields: [goal.createdById],
		references: [user.id],
	}),
}));

export const weightEntryRelations = relations(weightEntry, ({ one }) => ({
	user: one(user, {
		fields: [weightEntry.createdById],
		references: [user.id],
	}),
}));

export const supportTicketRelations = relations(supportTicket, ({ one }) => ({
	user: one(user, {
		fields: [supportTicket.createdById],
		references: [user.id],
	}),
}));
