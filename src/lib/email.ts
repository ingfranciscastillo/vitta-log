type EmailPayload = {
	to: string;
	subject: string;
	text: string;
	html?: string;
};

const RESEND_URL = "https://api.resend.com/emails";

export async function sendEmail(payload: EmailPayload): Promise<void> {
	const from = process.env.EMAIL_FROM ?? "noreply@example.com";
	const apiKey = process.env.RESEND_API_KEY;

	if (apiKey) {
		const res = await fetch(RESEND_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				from,
				to: payload.to,
				subject: payload.subject,
				text: payload.text,
				html: payload.html,
			}),
		});
		if (!res.ok) {
			throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
		}
		return;
	}

	// Dev/mock fallback: print to server console so the link can be
	// followed manually during local development.
	console.log("[email:mock]", { from, ...payload });
}
