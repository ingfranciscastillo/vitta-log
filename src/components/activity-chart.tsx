"use client";

import { eachDayOfInterval, format, startOfWeek, subMonths } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import type { ActivityMetric } from "#/lib/activity";
import { formatDate } from "#/lib/weight-utils";

type ActivityChartProps = {
  counts: Record<ActivityMetric, Map<string, number>>;
  months?: number;
  defaultMetric?: ActivityMetric;
};

type Selection = { date: string; count: number };

const METRIC_LABELS: Record<ActivityMetric, string> = {
  all: "Todo",
  weight: "Peso",
  habits: "Hábitos",
};

const METRIC_NOUN: Record<ActivityMetric, string> = {
  all: "registro",
  weight: "registro de peso",
  habits: "registro de hábito",
};

function intensityClass(count: number, max: number): string {
  if (count === 0) return "bg-muted";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-primary";
  if (ratio > 0.5) return "bg-primary/70";
  if (ratio > 0.25) return "bg-primary/40";
  return "bg-primary/20";
}

function pluralize(count: number, noun: string): string {
  if (count === 0) return `Sin ${noun}s`;
  if (count === 1) return `1 ${noun}`;
  return `${count} ${noun}s`;
}

export function ActivityChart({
  counts,
  months = 6,
  defaultMetric = "all",
}: ActivityChartProps) {
  const [metric, setMetric] = useState<ActivityMetric>(defaultMetric);
  const [selected, setSelected] = useState<Selection | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const weekCount = weeks.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || weekCount === 0) return;
    el.scrollLeft = el.scrollWidth;
  }, [weekCount]);

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
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
        <div className="flex gap-1 w-max px-0.5 pb-1">
          {weeks.map((week) => (
            <div key={week[0].toISOString()} className="flex flex-col gap-1">
              {week.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const count = counts[metric].get(key) ?? 0;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected({ date: key, count })}
                    className={`size-3 rounded-sm ${intensityClass(count, max)}`}
                    aria-label={`${key}: ${count}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              {selected && formatDate(selected.date)}
            </DialogTitle>
            <DialogDescription>
              {selected && pluralize(selected.count, METRIC_NOUN[metric])}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
