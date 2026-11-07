"use client";

import { useEffect, useState } from "react";
import { loadAlpacaSummary } from "@/lib/api/eagle";
import type { AlpacaSummary } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: AlpacaSummary };

// החשבון משתנה לאט יותר מהפיד. דקה מספיקה.
const REFRESH_MS = 60_000;

export function useAlpaca() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadAlpacaSummary()
      .then((summary) => {
        if (!cancelled) setState({ status: "ready", summary });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { state, reload: () => setTick((n) => n + 1) };
}