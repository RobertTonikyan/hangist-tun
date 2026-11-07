"use client";

import { useSyncExternalStore } from "react";
import { israelClock } from "@/lib/clock";
import type { Clock } from "@/lib/clock";

// השעון מתעדכן כל 15 שניות
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}
function read() {
  const clock = israelClock(new Date());
  return `${clock.today}|${clock.minutes}`;
}
function readOnServer() {
  return "";
}

export function useClock(): Clock | null {
  const text = useSyncExternalStore(subscribe, read, readOnServer);
  if (!text) return null;
  const [today, minutes] = text.split("|");
  return { today, minutes: Number(minutes) };
}