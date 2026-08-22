import { EmailLayout } from "./email-layout";
import { emailTheme } from "./theme";

export function PasswordChangedEmail() {
  return (
    <EmailLayout>
      <p
        style={{
          color: emailTheme.foreground,
          fontSize: 17,
          fontWeight: 700,
          textAlign: "center",
          margin: "0 0 8px",
        }}
      >
        Contraseña actualizada
      </p>
      <p
        style={{
          color: emailTheme.mutedForeground,
          fontSize: 14,
          lineHeight: 1.6,
          textAlign: "center",
          margin: "0 0 16px",
        }}
      >
        Tu contraseña de Vitta se cambió correctamente. Ya puedes iniciar sesión
        con tu nueva contraseña.
      </p>
      <p
        style={{
          color: emailTheme.negative,
          fontSize: 13,
          lineHeight: 1.5,
          textAlign: "center",
          backgroundColor: "#FDECEC",
          borderRadius: 12,
          padding: "12px 16px",
        }}
      >
        ¿No fuiste tú? Contacta a soporte de inmediato — alguien más podría
        tener acceso a tu cuenta.
      </p>
    </EmailLayout>
  );
}
