import { supabase } from "@/lib/supabase";
import type { Exam } from "@/lib/types";

// רק התאריכים של האירועים בטווח. בשביל העומס לא צריך יותר מזה.
export async function loadEventDates(from: string, to: string): Promise<string[]> {
  const { data, error } = await supabase.from("events").select("date").gte("date", from).lte("date", to);
  if (error) throw new Error(error.message);
  return (data as { date: string }[]).map((row) => row.date);
}

export async function loadExams(from: string, to: string): Promise<Exam[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("id, course, type, date")
    .gte("date", from)
    .lte("date", to)
    .order("date");
  if (error) throw new Error(error.message);
  return data as Exam[];
}

// "כמה דברים ביום זה כבר עמוס" מההגדרות של Rega. אם אין הגדרות, 5 כמו ב-Rega.
export async function loadDailyLimit(): Promise<number> {
  const { data, error } = await supabase.from("settings").select("daily_load_limit").maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { daily_load_limit: number } | null)?.daily_load_limit ?? 5;
}