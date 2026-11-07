import { supabase } from "@/lib/supabase";
import type { AlpacaSummary } from "@/lib/types";

// מבקש מהשרת של הפאנל את נתוני החשבון ב-Alpaca, עם הטוקן של Supabase שמוכיח שזה אתה
export async function loadAlpacaSummary(): Promise<AlpacaSummary> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("לא מחובר");

  const response = await fetch("/api/eagle", { headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? `שגיאה ${response.status}`);
  return body as AlpacaSummary;
}