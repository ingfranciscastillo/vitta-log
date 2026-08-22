"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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

type TourStepConfig = {
  id: string;
  title: string;
  description: string;
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
};

const TOUR_STEPS: ReadonlyArray<TourStepConfig> = [
  {
    id: "brand",
    title: "Bienvenido a Vitta",
    description:
      "Tu app personal de salud. Aquí llevas peso, hábitos, ayuno y más.",
    side: "bottom",
    align: "start",
  },
  {
    id: "quick-log",
    title: "Registra en segundos",
    description: "Toca el botón + para registrar peso, agua, pasos o sueño.",
    side: "bottom",
    align: "end",
  },
  {
    id: "suggestions",
    title: "Sugerencias para ti",
    description: "Cada día Vitta te sugiere qué registrar según tus datos.",
    side: "top",
    align: "center",
  },
  {
    id: "bottom-nav",
    title: "Todo en un lugar",
    description:
      "Aquí encuentras gráficos, ayuno, insights, perfil y configuración.",
    side: "top",
    align: "center",
  },
  {
    id: "settings-link",
    title: "Configura tu perfil",
    description: "Desde tu perfil puedes cambiar unidades, zona horaria y más.",
    side: "top",
    align: "end",
  },
];

type OnboardingTourProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OnboardingTour({ open, onOpenChange }: OnboardingTourProps) {
  const qc = useQueryClient();

  const markCompletedMut = useMutation({
    mutationFn: () => updateProfile({ data: { tourCompleted: true } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["current-user"] });
    },
  });

  const handleComplete = () => {
    markCompletedMut.mutate();
    onOpenChange(false);
  };

  const handleSkip = () => {
    markCompletedMut.mutate();
    onOpenChange(false);
  };

  return (
    <Tour
      open={open}
      onOpenChange={onOpenChange}
      onComplete={handleComplete}
      onSkip={handleSkip}
      dismissible
      modal
      sideOffset={12}
      spotlightPadding={6}
    >
      <TourPortal>
        <TourSpotlight />
        <TourSpotlightRing />
        {TOUR_STEPS.map((s, i) => (
          <TourStep
            key={s.id}
            target={`[data-tour="${s.id}"]`}
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
              <TourStepCounter
                format={(current, total) => `${current} de ${total}`}
              />
              <div className="flex items-center gap-2">
                <TourSkip variant="ghost">Omitir</TourSkip>
                <TourPrev variant="outline">Anterior</TourPrev>
                <TourNext>
                  {i === TOUR_STEPS.length - 1 ? "Finalizar" : "Siguiente"}
                </TourNext>
              </div>
            </TourFooter>
          </TourStep>
        ))}
      </TourPortal>
    </Tour>
  );
}

export default OnboardingTour;
