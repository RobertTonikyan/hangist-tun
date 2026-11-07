// "16:30" → 990 (דקות מתחילת היום)
export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}