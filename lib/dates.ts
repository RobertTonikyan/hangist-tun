const weekdays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

// "2026-11-04" → "יום רביעי, 4 בנובמבר"
export function longDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `יום ${weekdays[weekday]}, ${day} ב${months[month - 1]}`;
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