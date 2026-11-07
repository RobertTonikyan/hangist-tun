import Card from "@/components/home/Card";
import { signedPct, signedUsd, usd, usdCents } from "@/lib/money";
import type { AlpacaPosition } from "@/lib/types";

export default function PositionsTable({ positions }: { positions: AlpacaPosition[] }) {
  return (
    <Card title="פוזיציות פתוחות">
      {positions.length === 0 ? (
        <p className="text-eggshell/70">אין פוזיציות פתוחות. הבוט סוגר הכל 15 דקות לפני הנעילה.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-start text-eggshell/70">
                <th scope="col" className="pb-2 text-start font-medium">סימול</th>
                <th scope="col" className="pb-2 text-start font-medium">כמות</th>
                <th scope="col" className="pb-2 text-start font-medium">כניסה</th>
                <th scope="col" className="pb-2 text-start font-medium">עכשיו</th>
                <th scope="col" className="pb-2 text-start font-medium">שווי</th>
                <th scope="col" className="pb-2 text-start font-medium">רווח / הפסד</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.symbol} className="border-t border-eggshell/10">
                  <td className="py-2.5 font-bold" dir="ltr">
                    {p.symbol}
                  </td>
                  <td className="py-2.5">{p.qty}</td>
                  <td className="py-2.5" dir="ltr">
                    {usdCents(p.avgEntry)}
                  </td>
                  <td className="py-2.5" dir="ltr">
                    {usdCents(p.current)}
                  </td>
                  <td className="py-2.5" dir="ltr">
                    {usd(p.marketValue)}
                  </td>
                  <td className={`py-2.5 font-bold ${p.unrealizedPl >= 0 ? "text-gain" : "text-rust-light"}`} dir="ltr">
                    {signedUsd(p.unrealizedPl)} ({signedPct(p.unrealizedPlPct)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}