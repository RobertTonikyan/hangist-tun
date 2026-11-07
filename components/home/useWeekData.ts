"use client";

import { useEffect, useState } from "react";
import { loadDailyLimit, loadEventDates, loadExams } from "@/lib/db/week";
import { addDays } from "@/lib/dates";
import type { Exam } from "@/lib/types";

export type WeekData = { eventDates: string[]; exams: Exam[]; limit: number };

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: WeekData };

// מבחנים רואים שבועיים קדימה, כדי שיהיה זמן להתכונן
export const EXAMS_DAYS_AHEAD = 14;

export function useWeekData(today: string) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadEventDates(today, addDays(today, 6)), loadExams(today, addDays(today, EXAMS_DAYS_AHEAD)), loadDailyLimit()])
      .then(([eventDates, exams, limit]) => {
        if (!cancelled) setState({ status: "ready", data: { eventDates, exams, limit } });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [today]);

  return state;
}