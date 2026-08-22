"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
  target: string; // ej. `[data-tour="brand"]`
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
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tour?: string };
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

  useEffect(() => {
    if (search.tour === tourId) {
      setOpen(true);
      // limpia el query param para que no reabra en cada refresh
      navigate({
        search: (prev) => ({ ...prev, tour: undefined }),
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tour, tourId]);

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
