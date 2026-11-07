import { supabase } from "@/lib/supabase";
import type { JournalEntry } from "@/lib/types";

type JournalRow = {
  date: string;
  mood: number | null;
  mood_word: string | null;
  slept_at: string | null;
  woke_at: string | null;
  sleep_quality: number | null;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string | null;
  note: string | null;
};

const columns = "date, mood, mood_word, slept_at, woke_at, sleep_quality, breakfast, lunch, dinner, snacks, note";
const hhmm = (time: string | null) => (time ? time.slice(0, 5) : null);
// מחרוזת ריקה לא נשמרת במסד. שומרים null במקומה.
const orNull = (text: string) => (text.trim() === "" ? null : text.trim());

function toEntry(row: JournalRow): JournalEntry {
  return {
    date: row.date,
    mood: row.mood,
    moodWord: row.mood_word ?? "",
    sleptAt: hhmm(row.slept_at),
    wokeAt: hhmm(row.woke_at),
    sleepQuality: row.sleep_quality,
    breakfast: row.breakfast ?? "",
    lunch: row.lunch ?? "",
    dinner: row.dinner ?? "",
    snacks: row.snacks ?? "",
    note: row.note ?? "",
  };
}

// הרשומה של יום אחד, או null אם עוד לא מילאת אותו
export async function loadEntry(date: string): Promise<JournalEntry | null> {
  const { data, error } = await supabase.from("journal_entries").select(columns).eq("date", date).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toEntry(data as JournalRow) : null;
}

// שומר את הרשומה. אם כבר יש רשומה לאותו יום, היא מתעדכנת.
export async function saveEntry(entry: JournalEntry) {
  const { error } = await supabase.from("journal_entries").upsert(
    {
      date: entry.date,
      mood: entry.mood,
      mood_word: orNull(entry.moodWord),
      slept_at: entry.sleptAt,
      woke_at: entry.wokeAt,
      sleep_quality: entry.sleepQuality,
      breakfast: orNull(entry.breakfast),
      lunch: orNull(entry.lunch),
      dinner: orNull(entry.dinner),
      snacks: orNull(entry.snacks),
      note: orNull(entry.note),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" },
  );
  if (error) throw new Error(error.message);
}