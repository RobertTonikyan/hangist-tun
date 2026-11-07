import { addDays } from "./dates";

// השבוע בישראל מתחיל ביום ראשון. "2026-11-07" (שבת) → "2026-11-01"
export function weekStart(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addDays(date, -weekday);
}

// 7 התאריכים של השבוע שמתחיל ב-start
export function weekDays(start: string) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// "1.11 – 7.11"
export function weekRange(start: string) {
  const short = (value: string) => {
    const [, month, day] = value.split("-").map(Number);
    return `${day}.${month}`;
  };
  return `${short(start)} – ${short(addDays(start, 6))}`;
}