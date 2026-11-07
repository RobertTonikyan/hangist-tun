import Card from "@/components/home/Card";
import { describeAction, israelTime } from "@/lib/eagle";
import type { Tone } from "@/lib/eagle";
import type { EagleScore } from "@/lib/types";

const toneClass: Record<Tone, string> = {
  buy: "bg-gain text-ink",
  skip: "bg-eggshell/10 text-eggshell/80",
  info: "bg-denim/40 text-eggshell",
  error: "bg-rust-light text-ink",
};

export default function ScoresFeed({ scores }: { scores: EagleScore[] }) {
  return (
    <Card title="מבוט החדשות">
      {scores.length === 0 ? (
        <p className="text-eggshell/70">עוד אין ידיעות. ברגע שהבוט ידרג ידיעה, היא תופיע כאן.</p>
      ) : (
        <ol className="flex flex-col">
          {scores.map((row) => {
            const { label, tone } = describeAction(row.action);
            return (
              <li key={row.id} className="border-t border-eggshell/10 py-3 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold" dir="ltr">
                    {row.symbol}
                    {row.score !== null && <span className="ms-2 font-normal text-eggshell/70">{row.score}/10</span>}
                  </span>
                  <span title={row.action ?? undefined} className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${toneClass[tone]}`}>
                    {label}
                  </span>
                </div>
                {row.headline && (
                  <p className="mt-1 text-sm leading-relaxed" dir="auto">
                    {row.url ? (
                      <a href={row.url} target="_blank" rel="noreferrer" className="text-eggshell hover:underline">
                        {row.headline}
                      </a>
                    ) : (
                      row.headline
                    )}
                  </p>
                )}
                {row.reason && (
                  <p className="mt-1 text-xs text-eggshell/60" dir="auto">
                    {row.reason}
                  </p>
                )}
                <p className="mt-1 text-xs text-eggshell/60 tabular-nums">
                  {israelTime(row.ts)}
                  {row.source && ` · ${row.source}`}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}