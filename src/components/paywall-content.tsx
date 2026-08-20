import { CheckCircleIcon } from "@solar-icons/react/line-duotone";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "#/components/ui/button";
import { createProCheckout } from "#/lib/checkout.functions";
import { Bars } from "./bars";

const BENEFITS = [
  "Historial ilimitado de registros",
  "Estadísticas avanzadas y análisis",
  "Tendencias y promedios móviles",
  "IMC y otras métricas de salud",
  "Exportación en CSV, JSON y PDF",
  "Mayor personalización",
  "Recordatorios diarios",
  "Todas las funciones futuras, gratis",
];

type PaywallContentProps = {
  isPro?: boolean;
};

export function PaywallContent({ isPro = false }: PaywallContentProps = {}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const checkout = useServerFn(createProCheckout);

  const handleCheckout = async () => {
    if (isPro) {
      void navigate({ to: "/dashboard" });
      return;
    }
    if (typeof window !== "undefined" && window.self !== window.top) {
      toast.error(
        "El pago solo funciona desde la app publicada. Ábrela en una pestaña nueva para comprar.",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await checkout({
        data: {
          successUrl: `${window.location.origin}/pricing/success`,
          cancelUrl: window.location.href,
        },
      });
      if (res.url) {
        window.location.assign(res.url);
        return;
      }
      toast.error("No se pudo iniciar el pago.");
      setLoading(false);
    } catch {
      toast.error("No se pudo iniciar el pago.");
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-2xl text-balance">Desbloquea todo</h2>
      <p className="text-muted-foreground text-sm mt-1 text-pretty">
        Un solo pago. Tuyo para siempre.
      </p>

      <div className="my-5">
        <span className="font-display text-4xl tabular-nums">$12.99</span>
        <span className="text-muted-foreground text-sm"> USD</span>
      </div>

      <ul className="text-left space-y-2.5 mb-6">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm">
            <CheckCircleIcon
              secondaryOpacity={0}
              className="size-8 text-primary shrink-0 mt-0.5"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full h-12 font-display"
      >
        {loading ? (
          <>
            <Bars className="w-4 h-4 mr-2" /> Procesando...
          </>
        ) : isPro ? (
          "Ir al Dashboard"
        ) : (
          "Desbloquear Premium · $12.99"
        )}
      </Button>
      {!isPro && (
        <p className="text-[11px] text-muted-foreground mt-3">
          Pago seguro vía Stripe
        </p>
      )}
    </div>
  );
}

export default PaywallContent;
