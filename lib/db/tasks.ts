import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";

type TaskRow = {
  id: string;
  title: string;
  due_date: string | null;
  due_time: string | null;
  done: boolean;
  is_promise: boolean;
  promised_to: string | null;
};

// כל המשימות שעוד לא בוצעו. קודם אלה עם תאריך, ואחריהן אלה בלי.
export async function loadOpenTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_date, due_time, done, is_promise, promised_to")
    .eq("done", false)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);

  return (data as TaskRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    dueTime: row.due_time ? row.due_time.slice(0, 5) : null,
    done: row.done,
    isPromise: row.is_promise,
    promisedTo: row.promised_to,
  }));
}