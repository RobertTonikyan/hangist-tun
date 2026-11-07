// תאריכים נשמרים כ-"YYYY-MM-DD" ושעות כ-"HH:MM", לפי שעון ישראל.
export type DayEvent = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  location: string | null;
  travelMinutes: number;
  status: "confirmed" | "tentative";
  progress: "idle" | "on_way" | "done";
};