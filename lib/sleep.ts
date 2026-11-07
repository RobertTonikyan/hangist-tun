import { toMinutes } from "./time";

// כמה דקות ישנת. עובד גם כשנרדמת לפני חצות: 23:30 עד 07:00 = 450 דקות.
export function sleepMinutes(sleptAt: string, wokeAt: string) {
  return (toMinutes(wokeAt) - toMinutes(sleptAt) + 24 * 60) % (24 * 60);
}

// 410 → "6:50"
export function formatHours(minutes: number) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}