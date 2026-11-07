import Card from "@/components/home/Card";
import { usd } from "@/lib/money";
import type { AlpacaSummary } from "@/lib/types";

const W = 600;
const H = 180;

function shortDate(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return `${day}.${month}`;
}

export default function EquityChart({ history }: { history: AlpacaSummary["history"] }) {
  if (history.length < 2) {
    return (
      <Card title="שווי התיק, 30 יום">
        <p className="text-eggshell/70">עוד אין מספיק היסטוריה לגרף. הוא יתמלא אחרי כמה ימי מסחר.</p>
      </Card>
    );
  }

  const values = history.map((point) => point.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  // כל נקודה: x לפי המיקום ברשימה, y לפי השווי (למעלה = גבוה)
  const points = history.map((point, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - ((point.equity - min) / span) * (H - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = points.join(" ");
  const area = `0,${H} ${line} ${W},${H}`;

  const first = history[0];
  const last = history[history.length - 1];
  const up = last.equity >= first.equity;

  return (
    <Card title="שווי התיק, 30 יום">
      <div className="flex gap-3" dir="ltr">
        <div className="flex h-44 flex-col justify-between text-xs text-eggshell/60 tabular-nums">
          <span>{usd(max)}</span>
          <span>{usd(min)}</span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-44 min-w-0 flex-1"
          role="img"
          aria-label={`שווי התיק מ-${usd(first.equity)} ל-${usd(last.equity)}`}
        >
          <polygon points={area} className={up ? "fill-gain/15" : "fill-rust-light/15"} />
          <polyline
            points={line}
            fill="none"
            strokeWidth="2.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={up ? "stroke-gain" : "stroke-rust-light"}
          />
        </svg>
      </div>
      <div className="mt-1 flex justify-between ps-16 text-xs text-eggshell/60 tabular-nums" dir="ltr">
        <span>{shortDate(first.date)}</span>
        <span>{shortDate(last.date)}</span>
      </div>
    </Card>
  );
}