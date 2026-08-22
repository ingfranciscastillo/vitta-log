import { EmailLayout } from "./email-layout";
import { emailTheme } from "./theme";

export function VerifyEmail({ url }: { url: string }) {
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
        ¡Bienvenido a Vitta!
      </p>
      <p
        style={{
          color: emailTheme.mutedForeground,
          fontSize: 14,
          lineHeight: 1.6,
          textAlign: "center",
          margin: "0 0 20px",
        }}
      >
        Un solo paso más antes de empezar a llevar tu peso, hábitos y objetivos
        de salud: confirma que este correo es tuyo.
      </p>
      <a
        href={url}
        style={{
          display: "block",
          textAlign: "center",
          backgroundColor: emailTheme.primary,
          color: emailTheme.primaryForeground,
          borderRadius: 12,
          padding: "12px 20px",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Verificar mi correo
      </a>
      <p
        style={{
          color: emailTheme.mutedForeground,
          fontSize: 12,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        Si no creaste esta cuenta, puedes ignorar este mensaje.
      </p>
    </EmailLayout>
  );
}
