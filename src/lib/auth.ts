import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import {
	checkout,
	dodopayments,
	portal,
	webhooks,
} from "@dodopayments/better-auth";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import DodoPayments from "dodopayments";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { user } from "#/db/schema";
import { sendEmail } from "#/lib/email";

const DODO_PAYMENTS_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
const DODO_PAYMENTS_WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
const DODO_PRODUCT_PRO_LIFETIME = process.env.DODO_PRODUCT_PRO_LIFETIME;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

if (!DODO_PAYMENTS_API_KEY)
	throw new Error("DODO_PAYMENTS_API_KEY is required");
if (!DODO_PAYMENTS_WEBHOOK_SECRET)
	throw new Error("DODO_PAYMENTS_WEBHOOK_SECRET is required");
if (!DODO_PRODUCT_PRO_LIFETIME)
	throw new Error("DODO_PRODUCT_PRO_LIFETIME is required");

const dodoPayments = new DodoPayments({
	bearerToken: DODO_PAYMENTS_API_KEY,
	environment:
		process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins,
	rateLimit: {
		enabled: true,
		storage: "database",
		customRules: {
			"/api/auth/sign-in/email": { window: 60, max: 5 },
			"/api/auth/sign-up/email": { window: 60 * 60, max: 5 },
			"/api/auth/forget-password": { window: 60 * 60, max: 3 },
			"/api/auth/reset-password": { window: 60 * 60, max: 5 },
			"/api/auth/send-verification-email": { window: 60 * 60, max: 3 },
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
			strategy: "jwe",
		},
	},
	account: {
		encryptOAuthTokens: true,
		storeStateStrategy: "cookie",
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		},
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
		},
	},
	databaseHooks: {
		user: {
			update: {
				after: async (hook) => {
					const data = hook.data as { id: string; email?: string };
					const oldData = hook.oldData as { email?: string } | null;
					if (oldData?.email && oldData.email !== data.email) {
						console.warn(
							`[auth] email changed user=${data.id} from=${oldData.email} to=${data.email}`,
						);
					}
				},
			},
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
				input: false,
				returned: true,
			},
			sex: {
				type: "string",
				required: false,
				input: true,
				returned: true,
			},
			birthDate: {
				type: "string",
				required: false,
				input: true,
				returned: true,
			},
			height: {
				type: "number",
				required: false,
				input: true,
				returned: true,
			},
			weightUnit: {
				type: "string",
				defaultValue: "kg",
				input: true,
				returned: true,
			},
			heightUnit: {
				type: "string",
				defaultValue: "cm",
				input: true,
				returned: true,
			},
			timezone: {
				type: "string",
				defaultValue: "UTC",
				input: true,
				returned: true,
			},
			isPro: {
				type: "boolean",
				defaultValue: false,
				input: false,
				returned: true,
			},
			waterGoal: {
				type: "number",
				defaultValue: 2000,
				input: true,
				returned: true,
			},
			stepsGoal: {
				type: "number",
				defaultValue: 8000,
				input: true,
				returned: true,
			},
			sleepGoal: {
				type: "number",
				defaultValue: 8,
				input: true,
				returned: true,
			},
			calorieGoal: {
				type: "number",
				defaultValue: 2000,
				input: true,
				returned: true,
			},
			proteinGoal: {
				type: "number",
				defaultValue: 100,
				input: true,
				returned: true,
			},
			carbsGoal: {
				type: "number",
				defaultValue: 250,
				input: true,
				returned: true,
			},
			fatGoal: {
				type: "number",
				defaultValue: 70,
				input: true,
				returned: true,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Restablece tu contraseña",
				text: `Haz click en el siguiente enlace para restablecer tu contraseña: ${url}`,
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Verifica tu email",
				text: `Haz click en el siguiente enlace para verificar tu email: ${url}`,
			});
		},
	},

	plugins: [
		dodopayments({
			client: dodoPayments,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: DODO_PRODUCT_PRO_LIFETIME,
							slug: "pro-lifetime",
						},
					],
					successUrl: `${BETTER_AUTH_URL}/pricing/success`,
					authenticatedUsersOnly: true,
				}),
				portal(),
				webhooks({
					webhookKey: DODO_PAYMENTS_WEBHOOK_SECRET,
					onPaymentSucceeded: async (payload) => {
						const metadata = (
							payload as { data?: { metadata?: Record<string, unknown> } }
						).data?.metadata;
						const userId =
							(metadata?.userId as string | undefined) ?? undefined;
						if (!userId) return;
						await db
							.update(user)
							.set({ isPro: true })
							.where(eq(user.id, userId));
					},
				}),
			],
		}),
		tanstackStartCookies(),
	],
});
