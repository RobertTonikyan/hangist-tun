"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Card from "./Card";
import { useAlpaca } from "@/components/eagle/useAlpaca";
import { loadScores } from "@/lib/db/eagle";
import { describeAction, israelTime } from "@/lib/eagle";
import { signedPct, signedUsd, usd } from "@/lib/money";
import type { EagleScore } from "@/lib/types";

// הכרטיס טוען לבד. אם Alpaca או הבוט לא עונים, שאר מסך הבית ממשיך לעבוד.
function useLastScore() {
  const [score, setScore] = useState<EagleScore | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      loadScores(1)
        .then((rows) => {
          if (!cancelled) setScore(rows[0] ?? null);
        })
        .catch(() => {
          if (!cancelled) setScore(null);
        });
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return score;
}

const toneClass = {
  buy: "text-gain",
  skip: "text-eggshell/60",
  info: "text-denim",
  error: "text-rust-light",
};

export default function EagleCard() {
  const { state } = useAlpaca();
  const last = useLastScore();

  const link = (
    <Link href="/eagle" className="text-sm text-eggshell/70 underline-offset-4 hover:text-eggshell hover:underline">
      לעמוד המלא
    </Link>
  );

  return (
    <Card title="EAGLE" action={link}>
      {state.status === "loading" && <p className="text-eggshell/60 motion-safe:animate-pulse">טוען...</p>}

      {state.status === "error" && <p className="text-rust-light">Alpaca לא זמין כרגע</p>}

      {state.status === "ready" && (
        <AccountLine
          equity={state.summary.equity}
          lastEquity={state.summary.lastEquity}
          positions={state.summary.positions.length}
        />
      )}

      <div className="mt-5 border-t border-eggshell/10 pt-4">
        <p className="text-sm text-eggshell/70">הידיעה האחרונה שהבוט דירג</p>
        {last === undefined && <p className="mt-1 text-eggshell/60">...</p>}
        {last === null && <p className="mt-1 text-eggshell/60">עוד אין דירוגים</p>}
        {last && <LastScore score={last} />}
      </div>
    </Card>
  );
}

function AccountLine({ equity, lastEquity, positions }: { equity: number; lastEquity: number; positions: number }) {
  const change = equity - lastEquity;
  const changePct = lastEquity > 0 ? (change / lastEquity) * 100 : 0;
  const up = change >= 0;

  return (
    <div>
      <p className="text-3xl font-bold tabular-nums" dir="ltr">
        {usd(equity)}
      </p>
      <p className={`mt-0.5 text-sm font-medium tabular-nums ${up ? "text-gain" : "text-rust-light"}`} dir="ltr">
        {signedUsd(change)} ({signedPct(changePct)})
      </p>
      <p className="mt-2 text-sm text-eggshell/70">
        {positions === 0 ? "אין פוזיציות פתוחות" : positions === 1 ? "פוזיציה פתוחה אחת" : `${positions} פוזיציות פתוחות`}
      </p>
    </div>
  );
}

function LastScore({ score }: { score: EagleScore }) {
  const { label, tone } = describeAction(score.action);

  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-eggshell/10 text-lg font-bold tabular-nums">
        {score.score ?? "—"}
      </span>
      <div className="min-w-0">
        <p className="font-bold">
          <bdi dir="ltr">{score.symbol}</bdi> <span className={`text-sm font-medium ${toneClass[tone]}`}>· {label}</span>
        </p>
        <p className="truncate text-sm text-eggshell/60" dir="auto" title={score.headline ?? undefined}>
          {score.headline}
        </p>
        <p className="text-xs text-eggshell/50 tabular-nums">{israelTime(score.ts)}</p>
      </div>
    </div>
  );
}