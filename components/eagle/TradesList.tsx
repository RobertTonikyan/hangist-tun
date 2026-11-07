import Card from "@/components/home/Card";
import { describeSide, israelTime } from "@/lib/eagle";
import type { EagleTrade } from "@/lib/types";

const money = (value: number | null) => (value === null ? "" : `$${value.toFixed(2)}`);

export default function TradesList({ trades }: { trades: EagleTrade[] }) {
  return (
    <Card title="פעולות מול הברוקר">
      {trades.length === 0 ? (
        <p className="text-eggshell/70">עוד אין פעולות. ב-dry-run הבוט לא שולח פקודות, אז כאן יישאר ריק.</p>
      ) : (
        <ol className="flex flex-col">
          {trades.map((trade) => (
            <li key={trade.id} className="border-t border-eggshell/10 py-3 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold" dir="ltr">
                  {trade.symbol}
                </span>
                <span className="text-sm">{describeSide(trade.side)}</span>
              </div>
              <p className="mt-1 text-sm text-eggshell/75 tabular-nums" dir="ltr">
                {trade.qty ? `${trade.qty} × ${money(trade.price)}` : money(trade.price)}
                {trade.stopPrice !== null && ` · SL ${money(trade.stopPrice)}`}
              </p>
              {trade.reason && (
                <p className="mt-1 truncate text-xs text-eggshell/60" dir="auto" title={trade.reason}>
                  {trade.reason}
                </p>
              )}
              <p className="mt-1 text-xs text-eggshell/60 tabular-nums">{israelTime(trade.ts)}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}