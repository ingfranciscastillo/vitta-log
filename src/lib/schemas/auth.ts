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

export const verify2FASchema = z.object({
	code: z
		.string()
		.min(6, "Introduce el código completo")
		.max(6, "El código tiene 6 dígitos"),
	trustDevice: z.boolean(),
});

export const verifyBackupSchema = z.object({
	code: z
		.string()
		.min(8, "Código de respaldo inválido")
		.max(12, "Código de respaldo inválido"),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type VerifyBackupInput = z.infer<typeof verifyBackupSchema>;
