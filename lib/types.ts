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

// טקסט מוצפן: התוכן, ה-IV, ומפתח ה-AES עטוף במפתח הציבורי. הכל ב-base64.
export type Sealed = {
  ciphertext: string;
  iv: string;
  wrappedKey: string;
};

// רשומת יומן ליום אחד. המספרים גלויים (בשביל גרפים ורצף), הטקסט מוצפן ב-sealed.
export type JournalEntry = {
  date: string;
  mood: number | null;
  sleptAt: string | null;
  wokeAt: string | null;
  sleepQuality: number | null;
  sealed: Sealed | null;
};

// מה שמוצפן. נראה רק אחרי פתיחה בסיסמה.
export type JournalSecret = {
  moodWord: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  note: string;
};