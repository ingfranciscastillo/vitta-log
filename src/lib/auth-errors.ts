type AuthError = { code?: string; message?: string };

export function mapAuthError(error: AuthError): string {
	switch (error.code) {
		case "INVALID_EMAIL_OR_PASSWORD":
		case "USER_NOT_FOUND":
		case "INVALID_PASSWORD":
		case "INVALID_EMAIL":
			return "Email o contraseña incorrectos";
		case "TOO_MANY_REQUESTS":
			return "Demasiados intentos. Intenta más tarde.";
		case "EMAIL_NOT_VERIFIED":
			return "Verifica tu email antes de iniciar sesión";
		case "USER_ALREADY_EXISTS":
			return "Ya existe una cuenta con ese email";
		case "PASSWORD_TOO_SHORT":
		case "PASSWORD_TOO_LONG":
			return "La contraseña no cumple los requisitos";
		case "PASSWORD_TOO_SIMILAR":
			return "La nueva contraseña es demasiado similar";
		default:
			return error.message ?? "Error al iniciar sesión";
	}
}
