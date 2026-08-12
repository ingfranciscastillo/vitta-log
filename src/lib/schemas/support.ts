import { z } from "zod";

export const supportTicketSchema = z.object({
	subject: z
		.string()
		.min(1, "El asunto es obligatorio")
		.max(200, "Máximo 200 caracteres"),
	message: z
		.string()
		.min(1, "El mensaje es obligatorio")
		.max(2000, "Máximo 2000 caracteres"),
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
