"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Tour,
  TourArrow,
  TourClose,
  TourDescription,
  TourFooter,
  TourHeader,
  TourNext,
  TourPortal,
  TourPrev,
  TourSkip,
  TourSpotlight,
  TourSpotlightRing,
  TourStep,
  TourStepCounter,
  TourTitle,
} from "#/components/ui/tour";
import { updateProfile } from "#/lib/profile.functions";
import { hasTourCompleted, type TourId, withTourCompleted } from "#/lib/tours";

export type TourStepConfig = {
  target: string;
  title: string;
  description: string;
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
};

type TourRunnerProps = {
  tourId: TourId;
  steps: ReadonlyArray<TourStepConfig>;
  me: { completedTours?: string | null } | null | undefined;
};

export function TourRunner({ tourId, steps, me }: TourRunnerProps) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const completeMut = useMutation({
    mutationFn: (raw: string | null | undefined) =>
      updateProfile({
        data: { completedTours: withTourCompleted(raw, tourId) },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["current-user"] });
    },
  });

  // Disparo manual: alguien navegó con ?tour=goals (ej. desde Settings)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") !== tourId) return;

    setOpen(true);
    params.delete("tour");
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", newUrl);
  }, [tourId]);

  // Disparo automático: primera vez que este usuario ve esta sección
  useEffect(() => {
    if (!me) return;
    if (hasTourCompleted(me.completedTours, tourId)) return;
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [me, tourId]);

  const finish = () => {
    completeMut.mutate(me?.completedTours);
    setOpen(false);
  };

  return (
    <Tour
      open={open}
      onOpenChange={setOpen}
      onComplete={finish}
      onSkip={finish}
      dismissible
      modal
      sideOffset={12}
      spotlightPadding={6}
    >
      <TourPortal>
        <TourSpotlight />
        <TourSpotlightRing />
        {steps.map((s, i) => (
          <TourStep
            key={s.target}
            target={s.target}
            side={s.side}
            align={s.align}
          >
            <TourArrow />
            <TourClose />
            <TourHeader>
              <TourTitle>{s.title}</TourTitle>
              <TourDescription>{s.description}</TourDescription>
            </TourHeader>
            <TourFooter>
              <TourStepCounter format={(c, t) => `${c} de ${t}`} />
              <div className="flex items-center gap-2">
                <TourSkip variant="ghost">Omitir</TourSkip>
                <TourPrev variant="outline">Anterior</TourPrev>
                <TourNext>
                  {i === steps.length - 1 ? "Finalizar" : "Siguiente"}
                </TourNext>
              </div>
            </TourFooter>
          </TourStep>
        ))}
      </TourPortal>
    </Tour>
  );
}
