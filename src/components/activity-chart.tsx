"use client";

import { eachDayOfInterval, format, startOfWeek, subMonths } from "date-fns";
import { useMemo, useState } from "react";
import type { ActivityMetric } from "#/lib/activity";

type ActivityChartProps = {
  counts: Record<ActivityMetric, Map<string, number>>;
  months?: number;
  defaultMetric?: ActivityMetric;
};

const METRIC_LABELS: Record<ActivityMetric, string> = {
  all: "Todo",
  weight: "Peso",
  habits: "Hábitos",
};

function intensityClass(count: number, max: number): string {
  if (count === 0) return "bg-muted";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-primary";
  if (ratio > 0.5) return "bg-primary/70";
  if (ratio > 0.25) return "bg-primary/40";
  return "bg-primary/20";
}

export function ActivityChart({
  counts,
  months = 6,
  defaultMetric = "all",
}: ActivityChartProps) {
  const [metric, setMetric] = useState<ActivityMetric>(defaultMetric);

  const { weeks, max } = useMemo(() => {
    const end = new Date();
    const start = startOfWeek(subMonths(end, months));
    const days = eachDayOfInterval({ start, end });
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    const map = counts[metric];
    const m = Math.max(1, ...map.values());
    return { weeks: w, max: m };
  }, [counts, metric, months]);

  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm">Actividad</span>
        <div className="flex gap-1 rounded-full bg-muted p-0.5">
          {(Object.keys(METRIC_LABELS) as ActivityMetric[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                metric === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {METRIC_LABELS[key]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1 w-max px-0.5 pb-1">
          {weeks.map((week) => (
            <div key={week[0].toISOString()} className="flex flex-col gap-1">
              {week.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const count = counts[metric].get(key) ?? 0;
                return (
                  <div
                    key={key}
                    title={`${key}: ${count}`}
                    className={`size-3 rounded-sm ${intensityClass(count, max)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
