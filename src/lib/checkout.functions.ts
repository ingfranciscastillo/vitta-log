import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";
import { db } from "#/db";
import { user } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-07-29.dahlia",
});

const checkoutSchema = z.object({
	successUrl: z.string().url(),
	cancelUrl: z.string().url(),
});

export const createProCheckout = createServerFn({ method: "POST" })
	.validator(checkoutSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const userId = session.user.id;
		const [u] = await db
			.select({ stripeCustomerId: user.stripeCustomerId })
			.from(user)
			.where(eq(user.id, userId));

		const checkout = await stripeClient.checkout.sessions.create({
			mode: "payment",
			customer: u?.stripeCustomerId ?? undefined,
			client_reference_id: userId,
			line_items: [
				{ price: process.env.STRIPE_PRICE_PRO_LIFETIME!, quantity: 1 },
			],
			success_url: data.successUrl,
			cancel_url: data.cancelUrl,
			metadata: { userId, product: "pro_lifetime" },
		});

		return { url: checkout.url };
	});
