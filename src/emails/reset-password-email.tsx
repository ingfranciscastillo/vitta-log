import { EmailLayout } from "./email-layout";
import { emailTheme } from "./theme";

export function ResetPasswordEmail({ url }: { url: string }) {
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
        Restablece tu contraseña
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
        Recibimos una solicitud para cambiar la contraseña de tu cuenta. Toca el
        botón para elegir una nueva.
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
        Elegir nueva contraseña
      </a>
      <p
        style={{
          color: emailTheme.mutedForeground,
          fontSize: 12,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        Si no fuiste tú, ignora este correo — tu contraseña actual sigue siendo
        válida.
      </p>
    </EmailLayout>
  );
}
