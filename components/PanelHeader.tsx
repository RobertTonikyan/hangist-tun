"use client";

import { useClock } from "@/components/useClock";
import { formatTime, greeting, longDate } from "@/lib/dates";

export default function PanelHeader({ title }: { title?: string }) {
  const clock = useClock();
  if (!clock) return null;

  return (
    <header className="motion-safe:animate-fade">
      <p className="text-sm font-medium text-eggshell/75">
        <span className="font-bold tracking-wide text-eggshell">Hangist Tun</span> · {longDate(clock.today)} ·{" "}
        {formatTime(clock.minutes)}
      </p>
      <h1 className="mt-1 text-4xl font-bold">{title ?? greeting(clock.minutes)}</h1>
    </header>
  );
}