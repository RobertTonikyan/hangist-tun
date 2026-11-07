import { supabase } from "@/lib/supabase";
import type { StudySession } from "@/lib/types";

type SessionRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: StudySession["status"];
  // Supabase מחזיר את המבחן המקושר כאובייקט (או כמערך, תלוי בסוג הקשר)
  exams: { course: string } | { course: string }[] | null;
};

function courseOf(exams: SessionRow["exams"]) {
  const exam = Array.isArray(exams) ? exams[0] : exams;
  return exam?.course ?? "למידה";
}

// זמני למידה בטווח. הצעות שעוד לא אישרת ב-Rega לא מוצגות.
export async function loadStudySessions(from: string, to: string): Promise<StudySession[]> {
  const { data, error } = await supabase
    .from("study_sessions")
    .select("id, date, start_time, end_time, status, exams(course)")
    .gte("date", from)
    .lte("date", to)
    .neq("status", "suggested")
    .order("date")
    .order("start_time");

  if (error) throw new Error(error.message);

  return (data as unknown as SessionRow[]).map((row) => ({
    id: row.id,
    date: row.date,
    start: row.start_time.slice(0, 5),
    end: row.end_time.slice(0, 5),
    status: row.status,
    course: courseOf(row.exams),
  }));
}