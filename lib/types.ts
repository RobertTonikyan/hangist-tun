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

// משימה, הגשה או הבטחה. הגשה היא משימה עם תאריך יעד, והבטחה היא משימה עם isPromise.
export type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  done: boolean;
  isPromise: boolean;
  promisedTo: string | null;
};