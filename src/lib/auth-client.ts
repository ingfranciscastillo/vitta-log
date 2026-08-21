import { dodopaymentsClient } from "@dodopayments/better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		dodopaymentsClient(),
		twoFactorClient({
			onTwoFactorRedirect: () => {
				if (typeof window !== "undefined") {
					window.location.href = "/2fa";
				}
			},
		}),
	],
});
