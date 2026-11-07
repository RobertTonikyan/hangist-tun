"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import CountdownRing from "./CountdownRing";
import { useClock } from "@/components/useClock";
import { loadEventsForDay } from "@/lib/db/events";
import { leaveAt, nextEvent } from "@/lib/next-event";
import { formatTime } from "@/lib/dates";
import { toMinutes } from "@/lib/time";
import type { DayEvent } from "@/lib/types";

// ברירת המחדל של Rega. בהמשך נקרא את זה מטבלת ההגדרות.
const PREP_MINUTES = 10;
const REGA_URL = "http://localhost:3000";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; events: DayEvent[] };

function Frame({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="next-title" className="glass rounded-3xl p-6 motion-safe:animate-rise">
      <h2 id="next-title" className="text-sm font-medium text-eggshell/70">
        הדבר הבא
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function NextCard() {
  const clock = useClock();
  const today = clock?.today;
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!today) return;
    let cancelled = false;
    loadEventsForDay(today)
      .then((events) => {
        if (!cancelled) setState({ status: "ready", events });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [today, attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  if (!clock || state.status === "loading") {
    return (
      <Frame>
        <p className="text-eggshell/60 motion-safe:animate-pulse">טוען...</p>
      </Frame>
    );
  }

  if (state.status === "error") {
    return (
      <Frame>
        <p className="font-bold text-rust-light">לא הצלחתי לטעון את האירועים</p>
        <p className="mt-1 text-sm text-eggshell/60" dir="ltr">
          {state.message}
        </p>
        <button type="button" onClick={retry} className="mt-4 h-11 rounded-full border border-eggshell/30 px-5 transition hover:bg-eggshell/10">
          לנסות שוב
        </button>
      </Frame>
    );
  }

  const next = nextEvent(state.events, clock.minutes);

  if (!next) {
    return (
      <Frame>
        <p className="text-xl font-bold">אין עוד אירועים היום</p>
        <p className="mt-1 text-eggshell/70">מכאן והלאה היום פנוי.</p>
        <a
          href={`${REGA_URL}/add`}
          className="mt-5 inline-flex h-11 items-center rounded-full bg-eggshell px-5 font-semibold text-ink transition hover:bg-white"
        >
          להוסיף אירוע ב-Rega
        </a>
      </Frame>
    );
  }

  const leave = leaveAt(next, PREP_MINUTES);
  const ongoing = clock.minutes >= toMinutes(next.start);

  return (
    <Frame>
      <div className="flex flex-wrap items-center gap-6">
        <CountdownRing minutesLeft={ongoing ? 0 : leave - clock.minutes} />
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-bold">{next.title}</h3>
          <p className="mt-1 text-eggshell/70">
            {next.start}–{next.end}
            {next.location && ` · ${next.location}`}
          </p>
          <p className="mt-3 text-sm text-eggshell/70">
            {ongoing ? `מתקיים עכשיו, עד ${next.end}` : `לצאת ב-${formatTime(leave)}`}
            {!ongoing && next.travelMinutes > 0 && ` · ${next.travelMinutes} דק׳ נסיעה`}
          </p>
          {next.status === "tentative" && (
            <span className="mt-3 inline-block rounded-full border border-eggshell/30 px-3 py-1 text-xs">בבדיקה</span>
          )}
        </div>
      </div>
    </Frame>
  );
}