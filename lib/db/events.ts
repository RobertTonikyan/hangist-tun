import { supabase } from "@/lib/supabase";
import type { DayEvent } from "@/lib/types";

// ככה השורה נראית במסד: שמות עם קו תחתון, ושעות כמו "18:00:00".
type EventRow = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  travel_minutes: number | null;
  status: DayEvent["status"];
  progress: DayEvent["progress"] | null;
};

const hhmm = (time: string) => time.slice(0, 5);

export async function loadEventsForDay(date: string): Promise<DayEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, date, start_time, end_time, location, travel_minutes, status, progress")
    .eq("date", date)
    .order("start_time");

  if (error) throw new Error(error.message);

  return (data as EventRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    date: row.date,
    start: hhmm(row.start_time),
    end: hhmm(row.end_time),
    location: row.location,
    travelMinutes: row.travel_minutes ?? 0,
    status: row.status,
    progress: row.progress ?? "idle",
  }));
}