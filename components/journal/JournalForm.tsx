"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import UnlockForm from "./UnlockForm";
import { choiceClass, field, primaryButton } from "./styles";
import { seal, unlockPrivateKey, unseal } from "@/lib/crypto";
import type { KeyRecord } from "@/lib/crypto";
import { saveEntry } from "@/lib/db/journal";
import { formatHours, sleepMinutes } from "@/lib/sleep";
import { longDate } from "@/lib/dates";
import type { JournalEntry, JournalSecret } from "@/lib/types";

const moodLabels = ["קשה", "לא משהו", "בסדר", "טוב", "מעולה"];

// אחרי 5 דקות בלי הקלדה, טקסט פתוח ננעל לבד
const AUTO_LOCK_MS = 5 * 60 * 1000;

const meals = [
  ["breakfast", "בוקר"],
  ["lunch", "צהריים"],
  ["dinner", "ערב"],
  ["snacks", "נשנושים"],
] as const;

function emptySecret(): JournalSecret {
  return { moodWord: "", breakfast: "", lunch: "", dinner: "", snacks: "", note: "" };
}

function hasText(secret: JournalSecret) {
  return Object.values(secret).some((value) => value.trim() !== "");
}

function trimmed(secret: JournalSecret): JournalSecret {
  return Object.fromEntries(Object.entries(secret).map(([key, value]) => [key, value.trim()])) as JournalSecret;
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function Group({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex items-center gap-2 text-base font-bold">{title}</legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

type Props = { initial: JournalEntry; keys: KeyRecord };

export default function JournalForm({ initial, keys }: Props) {
  const [entry, setEntry] = useState(initial);
  // null = נעול: יש טקסט מוצפן שעוד לא פתחת. אחרת: הטקסט הגלוי, רק בזיכרון של הדפדפן.
  const [secret, setSecret] = useState<JournalSecret | null>(initial.sealed ? null : emptySecret());
  const [unlocking, setUnlocking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // טקסט שמור שנפתח ננעל שוב אחרי 5 דקות בלי שינוי
  useEffect(() => {
    if (secret === null || entry.sealed === null) return;
    const id = setTimeout(() => setSecret(null), AUTO_LOCK_MS);
    return () => clearTimeout(id);
  }, [secret, entry.sealed]);

  function set<K extends keyof JournalEntry>(key: K, value: JournalEntry[K]) {
    setEntry((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  function setText<K extends keyof JournalSecret>(key: K, value: string) {
    setSecret((current) => (current ? { ...current, [key]: value } : current));
    setMessage(null);
  }

  // הסיסמה פותחת את המפתח הפרטי, והמפתח הפרטי פותח את הטקסט. הסיסמה עצמה לא נשמרת בשום מקום.
  async function unlock(passphrase: string) {
    if (!entry.sealed) return;
    const privateKey = await unlockPrivateKey(keys, passphrase);
    const opened = await unseal<JournalSecret>(privateKey, entry.sealed);
    setSecret({ ...emptySecret(), ...opened });
    setUnlocking(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      // נעול: הטקסט המוצפן נשאר כמו שהוא. פתוח: מצפינים מחדש את מה שכתוב עכשיו.
      let sealed = entry.sealed;
      if (secret !== null) sealed = hasText(secret) ? await seal(keys.publicKey, trimmed(secret)) : null;

      const next = { ...entry, sealed };
      await saveEntry(next);
      setEntry(next);

      // אחרי שמירה, הטקסט נעלם מהמסך
      setSecret(sealed ? null : emptySecret());
      setMessage({ ok: true, text: sealed ? "נשמר ונעול" : "נשמר" });
    } catch (caught) {
      setMessage({ ok: false, text: caught instanceof Error ? caught.message : String(caught) });
    } finally {
      setBusy(false);
    }
  }

  const slept = entry.sleptAt && entry.wokeAt ? sleepMinutes(entry.sleptAt, entry.wokeAt) : null;

  return (
    <form onSubmit={handleSubmit} className="glass mt-8 flex max-w-3xl flex-col gap-8 rounded-3xl p-8 motion-safe:animate-rise">
      <p className="text-sm text-eggshell/70">{longDate(entry.date)}</p>

      <Group title="איך הרגשת היום?">
        <div className="flex flex-wrap gap-2">
          {moodLabels.map((label, index) => {
            const value = index + 1;
            const selected = entry.mood === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => set("mood", selected ? null : value)}
                className={`flex min-h-16 flex-1 basis-20 flex-col items-center justify-center gap-0.5 ${choiceClass(selected)}`}
              >
                <span className="text-xl font-bold">{value}</span>
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="שינה">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="slept" className="text-sm text-eggshell/75">
              נרדמתי
            </label>
            <input
              id="slept"
              type="time"
              dir="ltr"
              value={entry.sleptAt ?? ""}
              onChange={(e) => set("sleptAt", e.target.value || null)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="woke" className="text-sm text-eggshell/75">
              קמתי
            </label>
            <input
              id="woke"
              type="time"
              dir="ltr"
              value={entry.wokeAt ?? ""}
              onChange={(e) => set("wokeAt", e.target.value || null)}
              className={field}
            />
          </div>
          <div>
            <p className="text-sm text-eggshell/75">סה״כ</p>
            <p className="mt-1.5 flex h-12 items-center text-2xl font-bold">{slept === null ? "–" : formatHours(slept)}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-eggshell/75">איכות השינה</p>
        <div className="mt-1.5 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = entry.sleepQuality === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                aria-label={`איכות ${value} מתוך 5`}
                onClick={() => set("sleepQuality", selected ? null : value)}
                className={`h-11 w-12 font-bold ${choiceClass(selected)}`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </Group>

      <Group
        title={
          <>
            <LockIcon />
            רק בשבילך
          </>
        }
      >
        {secret === null ? (
          <div className="rounded-2xl border border-eggshell/15 bg-ink/30 p-6 text-center">
            <p className="font-bold">נשמר ונעול</p>
            <p className="mt-1 text-sm text-eggshell/70">המילה, האוכל והמחשבות של היום מוצפנים. רק הסיסמה פותחת אותם.</p>
            {unlocking ? (
              <UnlockForm onUnlock={unlock} onCancel={() => setUnlocking(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setUnlocking(true)}
                className="mt-4 h-11 rounded-full border border-eggshell/30 px-6 transition hover:bg-eggshell/10"
              >
                לפתוח
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="mood-word" className="text-sm text-eggshell/75">
                ההרגשה במילה אחת
              </label>
              <input id="mood-word" value={secret.moodWord} onChange={(e) => setText("moodWord", e.target.value)} className={field} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {meals.map(([key, label]) => (
                <div key={key}>
                  <label htmlFor={key} className="text-sm text-eggshell/75">
                    {label}
                  </label>
                  <input id={key} value={secret[key]} onChange={(e) => setText(key, e.target.value)} className={field} />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="note" className="text-sm text-eggshell/75">
                עוד משהו?
              </label>
              <textarea
                id="note"
                rows={4}
                value={secret.note}
                onChange={(e) => setText("note", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-eggshell/15 bg-ink/50 p-4 outline-none transition focus:border-eggshell/60 focus:ring-4 focus:ring-eggshell/10"
              />
            </div>

            {entry.sealed && (
              <button
                type="button"
                onClick={() => setSecret(null)}
                className="self-start text-sm text-eggshell/70 underline-offset-4 hover:text-eggshell hover:underline"
              >
                לנעול בלי לשמור שינויים
              </button>
            )}
          </div>
        )}
      </Group>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? "מצפין ושומר..." : "לשמור את היום"}
        </button>
        {message && (
          <p role="status" className={`text-sm ${message.ok ? "text-gain" : "text-rust-light"}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}