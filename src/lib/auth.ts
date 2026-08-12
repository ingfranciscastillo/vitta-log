import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "#/db";
import { sendEmail } from "#/lib/email";

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
	plugins: [tanstackStartCookies()],
});
