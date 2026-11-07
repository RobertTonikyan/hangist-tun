"use client";

import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";
import DayColumn from "@/components/rega/DayColumn";
import { useRegaWeek } from "@/components/rega/useRegaWeek";
import { useClock } from "@/components/useClock";
import { addDays } from "@/lib/dates";
import { weekDays, weekRange, weekStart } from "@/lib/week";

// הכתובת של אפליקציית Rega. אחרי ההעלאה לאוויר נחליף לכתובת האמיתית.
const REGA_URL = "http://localhost:3000";

const navButton = "flex size-11 items-center justify-center rounded-full border border-eggshell/30 text-xl transition hover:bg-eggshell/10";

function Week() {
  const clock = useClock();
  // כמה שבועות זזנו מהשבוע הנוכחי: 0 = השבוע, -1 = שבוע שעבר, 1 = שבוע הבא
  const [offset, setOffset] = useState(0);
  const start = clock ? addDays(weekStart(clock.today), offset * 7) : undefined;
  const { state, retry } = useRegaWeek(start);

  if (!clock || !start) return null;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setOffset((n) => n - 1)} className={navButton} aria-label="השבוע הקודם">
          ‹
        </button>
        <p className="min-w-32 text-center text-lg font-bold tabular-nums">{weekRange(start)}</p>
        <button type="button" onClick={() => setOffset((n) => n + 1)} className={navButton} aria-label="השבוע הבא">
          ›
        </button>
        {offset !== 0 && (
          <button type="button" onClick={() => setOffset(0)} className="h-11 rounded-full border border-eggshell/30 px-5 transition hover:bg-eggshell/10">
            חזרה להשבוע
          </button>
        )}
        <a
          href={`${REGA_URL}/add`}
          target="_blank"
          rel="noreferrer"
          className="ms-auto inline-flex h-11 items-center rounded-full bg-eggshell px-5 font-semibold text-ink transition hover:bg-white"
        >
          להוסיף ב-Rega
        </a>
      </div>

      {state.status === "loading" && <p className="mt-6 text-eggshell/60 motion-safe:animate-pulse">טוען את השבוע...</p>}

      {state.status === "error" && (
        <div className="glass mt-6 max-w-xl rounded-3xl p-6">
          <p className="font-bold text-rust-light">לא הצלחתי לטעון את השבוע</p>
          <p className="mt-1 text-sm text-eggshell/60" dir="ltr">
            {state.message}
          </p>
          <button type="button" onClick={retry} className="mt-4 h-11 rounded-full border border-eggshell/30 px-5 transition hover:bg-eggshell/10">
            לנסות שוב
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <div className={`mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 ${state.start !== start ? "opacity-50" : ""}`}>
          {weekDays(state.start).map((date) => (
            <DayColumn
              key={date}
              date={date}
              today={clock.today}
              events={state.data.events.filter((e) => e.date === date)}
              exams={state.data.exams.filter((e) => e.date === date)}
              sessions={state.data.sessions.filter((s) => s.date === date)}
              tasks={state.data.tasks.filter((t) => t.dueDate === date)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function RegaPage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader title="Rega" />
        <Week />
      </PanelShell>
    </RequireAuth>
  );
}