// תרגום של מה שהבוט כותב ביומן לעברית קצרה, וצבע לפי סוג.

export type Tone = "buy" | "skip" | "info" | "error";

export function describeAction(action: string | null): { label: string; tone: Tone } {
  const a = action ?? "";
  if (a.startsWith("ENTRY_SENT")) return { label: "נשלחה קנייה", tone: "buy" };
  if (a.startsWith("DRY-RUN")) return { label: "הייתה נקנית", tone: "buy" };
  if (a.startsWith("ALERT")) return { label: "התראה", tone: "info" };
  if (a.startsWith("skip: score")) return { label: "ציון נמוך", tone: "skip" };
  if (a.startsWith("CHASE_ABORT") || a.includes("CHASE_NO_REFERENCE")) return { label: "המחיר כבר ברח", tone: "skip" };
  if (a.includes("blocked by EAGLE")) return { label: "נחסם ע״י EAGLE", tone: "skip" };
  if (a.startsWith("skip: market closed")) return { label: "השוק סגור", tone: "skip" };
  if (a.startsWith("skip: too close to market close") || a.includes("entry cutoff")) return { label: "קרוב לנעילה", tone: "skip" };
  if (a.startsWith("skip: already holding")) return { label: "כבר מחזיק", tone: "skip" };
  if (a.startsWith("PREFILTER") || a.startsWith("PRICE_BELOW_MINIMUM")) return { label: "לא עבר סינון", tone: "skip" };
  if (a.startsWith("MAX_POSITIONS") || a.startsWith("SECTOR_CAP") || a.startsWith("DAILY_LOSS_LIMIT"))
    return { label: "מגבלת סיכון", tone: "skip" };
  if (a.startsWith("signal")) return { label: "אות ל-EAGLE", tone: "info" };
  if (a.startsWith("log: CORE")) return { label: "מניית ליבה", tone: "info" };
  if (a.startsWith("ORDER_REJECTED") || a.startsWith("error") || a.startsWith("STALE_PRICE")) return { label: "שגיאה", tone: "error" };
  if (a.startsWith("skip")) return { label: "דילוג", tone: "skip" };
  return { label: a || "—", tone: "info" };
}

const sides: Record<string, string> = {
  BUY: "פקודת קנייה",
  FILLED: "קנייה בוצעה",
  SELL: "מכירה",
  EXIT: "יציאה",
  CANCEL: "בוטלה",
  STOP_ARMED: "סטופ חירום",
};

export function describeSide(side: string) {
  return sides[side] ?? side;
}

export const modeLabels: Record<string, string> = {
  dry_run: "DRY-RUN",
  paper: "PAPER",
  live: "LIVE",
};

const formatter = new Intl.DateTimeFormat("he-IL", {
  timeZone: "Asia/Jerusalem",
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// "2026-11-09T14:42:10Z" → "9.11, 16:42" לפי שעון ישראל
export function israelTime(ts: string) {
  return formatter.format(new Date(ts));
}