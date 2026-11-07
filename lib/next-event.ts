import { toMinutes } from "./time";
import type { DayEvent } from "./types";

// הדבר הבא: האירוע הראשון היום שעוד לא נגמר ולא סומן "סיימתי".
export function nextEvent(events: DayEvent[], nowMinutes: number) {
  const upcoming = events
    .filter((event) => event.progress !== "done" && toMinutes(event.end) > nowMinutes)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  return upcoming[0] ?? null;
}

// מתי צריך לצאת: שעת ההתחלה, פחות הנסיעה, פחות זמן ההתארגנות.
export function leaveAt(event: DayEvent, prepMinutes: number) {
  return Math.max(toMinutes(event.start) - event.travelMinutes - prepMinutes, 0);
}