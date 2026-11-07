const weekdays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const shortWeekdays = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const DAY = 24 * 60 * 60 * 1000;

function parse(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day, time: Date.UTC(year, month - 1, day) };
}

// "2026-11-04" → "יום רביעי, 4 בנובמבר"
export function longDate(value: string) {
  const { month, day, time } = parse(value);
  return `יום ${weekdays[new Date(time).getUTCDay()]}, ${day} ב${months[month - 1]}`;
}

// כמה ימים מ-from עד to. שלילי אם to כבר עבר.
export function daysBetween(from: string, to: string) {
  return Math.round((parse(to).time - parse(from).time) / DAY);
}

// "היום", "מחר", "מחרתיים", "ה׳ 12.11", או "עבר המועד"
export function dayLabel(value: string, today: string) {
  const offset = daysBetween(today, value);
  if (offset < 0) return "עבר המועד";
  if (offset === 0) return "היום";
  if (offset === 1) return "מחר";
  if (offset === 2) return "מחרתיים";
  const { month, day, time } = parse(value);
  return `${shortWeekdays[new Date(time).getUTCDay()]} ${day}.${month}`;
}

// 990 → "16:30"
export function formatTime(minutes: number) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function greeting(minutes: number) {
  if (minutes < 5 * 60) return "לילה טוב";
  if (minutes < 12 * 60) return "בוקר טוב";
  if (minutes < 17 * 60) return "אחר הצהריים טובים";
  return "ערב טוב";
}