"use client";

import { useEffect, useState } from "react";
import { loadScores, loadTrades } from "@/lib/db/eagle";
import type { EagleScore, EagleTrade } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; scores: EagleScore[]; trades: EagleTrade[]; loadedAt: number };

// כל כמה זמן טוענים מחדש, בזמן שהדף פתוח
const REFRESH_MS = 30_000;

export function useEagleData() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadScores(), loadTrades()])
      .then(([scores, trades]) => {
        if (!cancelled) setState({ status: "ready", scores, trades, loadedAt: Date.now() });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // טעינה אוטומטית כל 30 שניות
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { state, reload: () => setTick((n) => n + 1) };
}