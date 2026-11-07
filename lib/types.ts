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


// שורה מהיומן של בוט החדשות: ידיעה אחת, הציון שלה, ומה הבוט עשה איתה
export type EagleScore = {
  id: number;
  ts: string;
  source: string | null;
  headline: string | null;
  url: string | null;
  symbol: string | null;
  score: number | null;
  reason: string | null;
  action: string | null;
  mode: string | null;
};

// פעולה מול הברוקר: קנייה, מילוי, יציאה, ביטול...
export type EagleTrade = {
  id: number;
  ts: string;
  symbol: string;
  side: string;
  qty: number | null;
  price: number | null;
  stopPrice: number | null;
  reason: string | null;
  mode: string | null;
};