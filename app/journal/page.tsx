"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";
import { useClock } from "@/components/useClock";
import { loadEntry, saveEntry } from "@/lib/db/journal";
import { formatHours, sleepMinutes } from "@/lib/sleep";
import { longDate } from "@/lib/dates";
import type { JournalEntry } from "@/lib/types";

const moodLabels = ["קשה", "לא משהו", "בסדר", "טוב", "מעולה"];

function emptyEntry(date: string): JournalEntry {
  return {
    date,
    mood: null,
    moodWord: "",
    sleptAt: null,
    wokeAt: null,
    sleepQuality: null,
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
    note: "",
  };
}

const field =
  "mt-1.5 h-12 w-full rounded-xl border border-eggshell/15 bg-ink/50 px-4 placeholder:text-eggshell/40 outline-none transition focus:border-eggshell/60 focus:ring-4 focus:ring-eggshell/10";

function choiceClass(selected: boolean) {
  return `rounded-2xl border transition ${
    selected ? "border-eggshell bg-eggshell text-ink" : "border-eggshell/20 bg-eggshell/5 hover:bg-eggshell/10"
  }`;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-base font-bold">{title}</legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

function JournalForm({ initial }: { initial: JournalEntry }) {
  const [entry, setEntry] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // מעדכן שדה אחד ומשאיר את כל השאר כמו שהם
  function set<K extends keyof JournalEntry>(key: K, value: JournalEntry[K]) {
    setEntry((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await saveEntry(entry);
      setMessage({ ok: true, text: "נשמר" });
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
        <label htmlFor="mood-word" className="mt-4 block text-sm text-eggshell/75">
          במילה אחת
        </label>
        <input id="mood-word" value={entry.moodWord} onChange={(e) => set("moodWord", e.target.value)} className={field} />
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

      <Group title="אוכל">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["breakfast", "בוקר"],
              ["lunch", "צהריים"],
              ["dinner", "ערב"],
              ["snacks", "נשנושים"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className="text-sm text-eggshell/75">
                {label}
              </label>
              <input id={key} value={entry[key]} onChange={(e) => set(key, e.target.value)} className={field} />
            </div>
          ))}
        </div>
      </Group>

      <div>
        <label htmlFor="note" className="text-base font-bold">
          עוד משהו?
        </label>
        <textarea
          id="note"
          rows={3}
          value={entry.note}
          onChange={(e) => set("note", e.target.value)}
          className="mt-3 w-full rounded-xl border border-eggshell/15 bg-ink/50 p-4 outline-none transition focus:border-eggshell/60 focus:ring-4 focus:ring-eggshell/10"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="h-12 rounded-full bg-eggshell px-8 font-semibold text-ink transition hover:bg-white active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "שומר..." : "לשמור את היום"}
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

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; entry: JournalEntry | null };

function JournalScreen() {
  const clock = useClock();
  const today = clock?.today;
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!today) return;
    let cancelled = false;
    loadEntry(today)
      .then((entry) => {
        if (!cancelled) setState({ status: "ready", entry });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [today]);

  if (!today || state.status === "loading") {
    return <p className="mt-8 text-eggshell/60 motion-safe:animate-pulse">טוען...</p>;
  }

  if (state.status === "error") {
    return (
      <div className="glass mt-8 max-w-xl rounded-3xl p-6">
        <p className="font-bold text-rust-light">לא הצלחתי לטעון את היומן</p>
        <p className="mt-1 text-sm text-eggshell/60" dir="ltr">
          {state.message}
        </p>
      </div>
    );
  }

  // key={today}: אם היום מתחלף בחצות, הטופס מתחיל מחדש עם היום החדש
  return <JournalForm key={today} initial={state.entry ?? emptyEntry(today)} />;
}

export default function JournalPage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader title="יומן" />
        <JournalScreen />
      </PanelShell>
    </RequireAuth>
  );
}