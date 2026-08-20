import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().min(1, "El email es obligatorio").email("Email no válido"),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = z.object({
	name: z
		.string()
		.min(1, "El nombre es obligatorio")
		.max(80, "Máximo 80 caracteres"),
	email: z.string().min(1, "El email es obligatorio").email("Email no válido"),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const forgotPasswordSchema = z.object({
	email: z.string().min(1, "El email es obligatorio").email("Email no válido"),
});

export const resetPasswordSchema = z.object({
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Introduce tu contraseña actual"),
		newPassword: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
		confirmPassword: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	})
	.refine((d) => d.newPassword !== d.currentPassword, {
		message: "La nueva contraseña debe ser distinta",
		path: ["newPassword"],
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
