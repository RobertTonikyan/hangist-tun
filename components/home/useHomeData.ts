"use client";

import { useCallback, useEffect, useState } from "react";
import { loadEventsForDay } from "@/lib/db/events";
import { loadOpenTasks } from "@/lib/db/tasks";
import type { DayEvent, Task } from "@/lib/types";

export type HomeData = { events: DayEvent[]; tasks: Task[] };

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: HomeData };

async function loadAll(today: string): Promise<HomeData> {
  const [events, tasks] = await Promise.all([loadEventsForDay(today), loadOpenTasks()]);
  return { events, tasks };
}

// טוען את כל מה שמסך הבית צריך, בבת אחת.
export function useHomeData(today: string | undefined) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!today) return;
    let cancelled = false;

    loadAll(today)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
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

  // אחרי שמירה: טוענים מחדש בשקט. אם נכשל, השגיאה עוברת למי שקרא לפונקציה.
  const refresh = useCallback(async () => {
    if (!today) return;
    const data = await loadAll(today);
    setState({ status: "ready", data });
  }, [today]);

  return { state, retry, refresh };
}