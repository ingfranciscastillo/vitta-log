import { EmailLayout } from "./email-layout";
import { emailTheme } from "./theme";

export function OtpEmail({ otp }: { otp: string }) {
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
        Tu código de acceso
      </p>
      <p
        style={{
          color: emailTheme.mutedForeground,
          fontSize: 14,
          textAlign: "center",
          margin: "0 0 4px",
        }}
      >
        Úsalo para completar el inicio de sesión:
      </p>
      <p
        style={{
          color: emailTheme.primary,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 8,
          textAlign: "center",
          margin: "8px 0 4px",
        }}
      >
        {otp}
      </p>
      <p
        style={{
          color: emailTheme.mutedForeground,
          fontSize: 12,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        Válido por 5 minutos. Si no solicitaste este código, ignora este correo.
      </p>
    </EmailLayout>
  );
}
