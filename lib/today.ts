import { toMinutes } from "./time";
import type { DayEvent, Task } from "./types";

export type RowState = "done" | "past" | "now" | "later";

export type TodayRow = {
  key: string;
  time: string;
  sortBy: number;
  title: string;
  kind: "event" | "task";
  state: RowState;
  tag: string | null;
};

export function todayRows(events: DayEvent[], tasks: Task[], today: string, minutes: number): TodayRow[] {
  const eventRows: TodayRow[] = events.map((event) => {
    const start = toMinutes(event.start);
    const end = toMinutes(event.end);
    const state: RowState =
      event.progress === "done" ? "done" : end <= minutes ? "past" : start <= minutes ? "now" : "later";
    return {
      key: `event-${event.id}`,
      time: event.start,
      sortBy: start,
      title: event.title,
      kind: "event",
      state,
      tag: event.status === "tentative" ? "בבדיקה" : state === "now" ? "עכשיו" : null,
    };
  });

  const taskRows: TodayRow[] = tasks
    .filter((task) => task.dueDate === today)
    .map((task) => ({
      key: `task-${task.id}`,
      time: task.dueTime ?? "היום",
      // משימה בלי שעה יורדת לסוף הרשימה
      sortBy: task.dueTime ? toMinutes(task.dueTime) : 24 * 60,
      title: task.title,
      kind: "task",
      state: "later",
      tag: task.isPromise ? (task.promisedTo ? `הבטחה ל${task.promisedTo}` : "הבטחה") : "להגשה",
    }));

  return [...eventRows, ...taskRows].sort((a, b) => a.sortBy - b.sortBy);
}