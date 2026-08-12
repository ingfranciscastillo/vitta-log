import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "#/db";
import { user } from "#/db/schema";
import { sendEmail } from "#/lib/email";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-07-29.dahlia",
});

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
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
			stripeCustomerId: {
				type: "string",
				required: false,
				input: false,
				returned: false,
			},
			isPro: {
				type: "boolean",
				defaultValue: false,
				input: false,
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
		stripe({
			stripeClient,
			stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
			createCustomerOnSignUp: true,
			onEvent: async (event) => {
				if (event.type === "checkout.session.completed") {
					const session = event.data.object as Stripe.Checkout.Session;
					if (session.mode !== "payment") return;
					const userId =
						session.client_reference_id ??
						(session.metadata?.userId as string | undefined);
					if (!userId) return;
					await db.update(user).set({ isPro: true }).where(eq(user.id, userId));
				}
			},
		}),
		tanstackStartCookies(),
	],
});
