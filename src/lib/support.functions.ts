import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import { supportTicket } from "#/db/schema";
import { ensureSession } from "#/lib/auth.functions";
import { supportTicketSchema } from "#/lib/schemas/support";

export const createSupportTicket = createServerFn({ method: "POST" })
	.validator(supportTicketSchema)
	.handler(async ({ data }) => {
		const session = await ensureSession();
		const [row] = await db
			.insert(supportTicket)
			.values({
				subject: data.subject,
				message: data.message,
				createdById: session.user.id,
			})
			.returning({ id: supportTicket.id });
		return { id: row?.id ?? "" };
	});
