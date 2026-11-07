import { supabase } from "@/lib/supabase";
import type { KeyRecord } from "@/lib/crypto";
import type { JournalEntry } from "@/lib/types";

type JournalRow = {
  date: string;
  mood: number | null;
  slept_at: string | null;
  woke_at: string | null;
  sleep_quality: number | null;
  secret_ciphertext: string | null;
  secret_iv: string | null;
  secret_key: string | null;
};

const columns = "date, mood, slept_at, woke_at, sleep_quality, secret_ciphertext, secret_iv, secret_key";
const hhmm = (time: string | null) => (time ? time.slice(0, 5) : null);

function toEntry(row: JournalRow): JournalEntry {
  return {
    date: row.date,
    mood: row.mood,
    sleptAt: hhmm(row.slept_at),
    wokeAt: hhmm(row.woke_at),
    sleepQuality: row.sleep_quality,
    sealed:
      row.secret_ciphertext && row.secret_iv && row.secret_key
        ? { ciphertext: row.secret_ciphertext, iv: row.secret_iv, wrappedKey: row.secret_key }
        : null,
  };
}

// הרשומה של יום אחד, או null אם עוד לא מילאת אותו
export async function loadEntry(date: string): Promise<JournalEntry | null> {
  const { data, error } = await supabase.from("journal_entries").select(columns).eq("date", date).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toEntry(data as JournalRow) : null;
}

// שומר את הרשומה. אם כבר יש רשומה לאותו יום, היא מתעדכנת.
// הטקסט מגיע לכאן כבר מוצפן (sealed). טקסט גלוי לא נשלח אף פעם.
export async function saveEntry(entry: JournalEntry) {
  const { error } = await supabase.from("journal_entries").upsert(
    {
      date: entry.date,
      mood: entry.mood,
      slept_at: entry.sleptAt,
      woke_at: entry.wokeAt,
      sleep_quality: entry.sleepQuality,
      secret_ciphertext: entry.sealed?.ciphertext ?? null,
      secret_iv: entry.sealed?.iv ?? null,
      secret_key: entry.sealed?.wrappedKey ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" },
  );
  if (error) throw new Error(error.message);
}

type KeyRow = { public_key: string; encrypted_private_key: string; salt: string; iv: string };

// המפתחות של היומן, או null אם עוד לא בחרת סיסמה
export async function loadKeyRecord(): Promise<KeyRecord | null> {
  const { data, error } = await supabase
    .from("journal_keys")
    .select("public_key, encrypted_private_key, salt, iv")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as KeyRow;
  return { publicKey: row.public_key, encryptedPrivateKey: row.encrypted_private_key, salt: row.salt, iv: row.iv };
}

export async function saveKeyRecord(record: KeyRecord) {
  const { error } = await supabase.from("journal_keys").insert({
    public_key: record.publicKey,
    encrypted_private_key: record.encryptedPrivateKey,
    salt: record.salt,
    iv: record.iv,
  });
  if (error) throw new Error(error.message);
}