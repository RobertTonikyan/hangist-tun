import { addDays } from "./dates";

// רצף: כמה ימים רצופים מילאת, עד היום. אם היום עוד לא מילאת, סופרים עד אתמול,
// כדי שהרצף לא "יישבר" בבוקר רק כי עוד לא הגעת לזה.
export function streak(dates: string[], today: string) {
  const filled = new Set(dates);
  let day = filled.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (filled.has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

// n הימים האחרונים, מהישן לחדש, כשהאחרון הוא היום
export function lastDays(today: string, n: number) {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}