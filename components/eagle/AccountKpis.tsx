import { signedPct, signedUsd, usd } from "@/lib/money";
import type { AlpacaSummary } from "@/lib/types";

function Kpi({ label, value, sub, subClass = "text-eggshell/70" }: { label: string; value: string; sub?: string; subClass?: string }) {
  return (
    <section aria-label={label} className="glass rounded-3xl p-5 motion-safe:animate-rise">
      <p className="text-sm text-eggshell/70">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums" dir="ltr">
        {value}
      </p>
      {sub && (
        <p className={`mt-0.5 text-sm tabular-nums ${subClass}`} dir="ltr">
          {sub}
        </p>
      )}
    </section>
  );
}

export default function AccountKpis({ summary }: { summary: AlpacaSummary }) {
  const change = summary.equity - summary.lastEquity;
  const changePct = summary.lastEquity > 0 ? (change / summary.lastEquity) * 100 : 0;
  const cashPct = summary.equity > 0 ? (summary.cash / summary.equity) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      <Kpi label="שווי התיק" value={usd(summary.equity)} />
      <Kpi
        label="מאז הסגירה הקודמת"
        value={signedUsd(change)}
        sub={signedPct(changePct)}
        subClass={change >= 0 ? "text-gain" : "text-rust-light"}
      />
      <Kpi label="מזומן" value={usd(summary.cash)} sub={`${cashPct.toFixed(0)}%`} />
      <Kpi label="פוזיציות פתוחות" value={String(summary.positions.length)} />
    </div>
  );
}