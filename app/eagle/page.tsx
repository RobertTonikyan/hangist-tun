"use client";

import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";
import ScoresFeed from "@/components/eagle/ScoresFeed";
import TradesList from "@/components/eagle/TradesList";
import { useEagleData } from "@/components/eagle/useEagleData";
import { modeLabels } from "@/lib/eagle";

function EagleScreen() {
  const { state, reload } = useEagleData();

  if (state.status === "loading") {
    return <p className="mt-8 text-eggshell/60 motion-safe:animate-pulse">טוען...</p>;
  }

  if (state.status === "error") {
    return (
      <div className="glass mt-8 max-w-xl rounded-3xl p-6">
        <p className="font-bold text-rust-light">לא הצלחתי לטעון את נתוני הבוט</p>
        <p className="mt-1 text-sm text-eggshell/60" dir="ltr">
          {state.message}
        </p>
        <button type="button" onClick={reload} className="mt-4 h-11 rounded-full border border-eggshell/30 px-5 transition hover:bg-eggshell/10">
          לנסות שוב
        </button>
      </div>
    );
  }

  const latestMode = state.scores[0]?.mode ?? state.trades[0]?.mode ?? null;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-eggshell/70">
        {latestMode && (
          <span className="rounded-full border border-eggshell/30 px-3 py-1 text-xs font-bold tracking-wider text-eggshell">
            {modeLabels[latestMode] ?? latestMode}
          </span>
        )}
        <span>מתעדכן לבד כל 30 שניות</span>
        <button type="button" onClick={reload} className="underline-offset-4 hover:text-eggshell hover:underline">
          לרענן עכשיו
        </button>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <ScoresFeed scores={state.scores} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <TradesList trades={state.trades} />
        </div>
      </div>
    </>
  );
}

export default function EaglePage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader title="EAGLE" />
        <EagleScreen />
      </PanelShell>
    </RequireAuth>
  );
}