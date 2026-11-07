"use client";

import { useEffect, useState } from "react";
import { loadEventsInRange } from "@/lib/db/events";
import { loadExams } from "@/lib/db/week";
import { loadStudySessions } from "@/lib/db/study";
import { loadOpenTasks } from "@/lib/db/tasks";
import { addDays } from "@/lib/dates";
import type { DayEvent, Exam, StudySession, Task } from "@/lib/types";

export type RegaWeek = { events: DayEvent[]; exams: Exam[]; sessions: StudySession[]; tasks: Task[] };

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; start: string; data: RegaWeek };

async function loadWeek(start: string): Promise<RegaWeek> {
  const end = addDays(start, 6);
  const [events, exams, sessions, openTasks] = await Promise.all([
    loadEventsInRange(start, end),
    loadExams(start, end),
    loadStudySessions(start, end),
    loadOpenTasks(),
  ]);
  const tasks = openTasks.filter((task) => task.dueDate !== null && task.dueDate >= start && task.dueDate <= end);
  return { events, exams, sessions, tasks };
}

// טוען שבוע אחד. כשעוברים שבוע, הנתונים הקודמים נשארים על המסך עד שהחדשים מגיעים.
export function useRegaWeek(start: string | undefined) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!start) return;
    let cancelled = false;
    loadWeek(start)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", start, data });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [start, attempt]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}