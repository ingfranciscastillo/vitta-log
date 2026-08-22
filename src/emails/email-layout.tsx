import type { ReactNode } from "react";
import { emailTheme } from "./theme";

const LOGO_URL = "https://vitta-log.vercel.app/logo.png";

export function EmailLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: "32px 16px",
          backgroundColor: emailTheme.background,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ maxWidth: 420, margin: "0 auto" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: emailTheme.card,
                  borderRadius: 16,
                  border: `1px solid ${emailTheme.border}`,
                  padding: 24,
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <img
                    src={LOGO_URL}
                    alt="Vitta"
                    width={44}
                    height={44}
                    style={{ display: "inline-block" }}
                  />
                </div>
                {children}
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
