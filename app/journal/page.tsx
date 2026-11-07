"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";
import JournalForm from "@/components/journal/JournalForm";
import SetupLock from "@/components/journal/SetupLock";
import { useClock } from "@/components/useClock";
import { loadEntry, loadKeyRecord } from "@/lib/db/journal";
import type { KeyRecord } from "@/lib/crypto";
import type { JournalEntry } from "@/lib/types";

function emptyEntry(date: string): JournalEntry {
  return { date, mood: null, sleptAt: null, wokeAt: null, sleepQuality: null, sealed: null };
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; keys: KeyRecord | null; entry: JournalEntry | null };

function JournalScreen() {
  const clock = useClock();
  const today = clock?.today;
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!today) return;
    let cancelled = false;
    Promise.all([loadKeyRecord(), loadEntry(today)])
      .then(([keys, entry]) => {
        if (!cancelled) setState({ status: "ready", keys, entry });
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

  // עוד אין סיסמה ליומן: קודם בוחרים אחת
  if (!state.keys) {
    return <SetupLock onDone={(keys) => setState({ ...state, keys })} />;
  }

  // key={today}: אם היום מתחלף בחצות, הטופס מתחיל מחדש עם היום החדש
  return <JournalForm key={today} initial={state.entry ?? emptyEntry(today)} keys={state.keys} />;
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