import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Resend } from "resend";

type EmailPayload = {
	to: string;
	subject: string;
	text: string;
	react?: ReactElement;
	html?: string;
};

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

export async function sendEmail(payload: EmailPayload): Promise<void> {
	const from = process.env.EMAIL_FROM ?? "noreply@example.com";
	const html =
		payload.html ??
		(payload.react
			? `<!DOCTYPE html>${renderToStaticMarkup(payload.react)}`
			: undefined);

	if (resend) {
		const { error } = await resend.emails.send({
			from,
			to: payload.to,
			subject: payload.subject,
			text: payload.text,
			html,
		});
		if (error) {
			throw new Error(`Resend send failed: ${error.message}`);
		}
		return;
	}

	console.log("[email:mock]", {
		from,
		to: payload.to,
		subject: payload.subject,
	});
}
