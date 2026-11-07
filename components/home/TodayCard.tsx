import Link from "next/link";
import Card from "./Card";
import { todayRows } from "@/lib/today";
import type { TodayRow } from "@/lib/today";
import type { DayEvent, Task } from "@/lib/types";

function dotClass(row: TodayRow) {
  if (row.kind === "task") return "rounded-sm bg-rust-light";
  if (row.state === "now") return "rounded-full bg-eggshell";
  if (row.state === "later") return "rounded-full bg-denim";
  return "rounded-full bg-eggshell/30";
}

function textClass(row: TodayRow) {
  if (row.state === "done") return "text-eggshell/50 line-through";
  if (row.state === "past") return "text-eggshell/50";
  if (row.state === "now") return "font-bold";
  return "";
}

type Props = { events: DayEvent[]; tasks: Task[]; today: string; minutes: number };

export default function TodayCard({ events, tasks, today, minutes }: Props) {
  const rows = todayRows(events, tasks, today, minutes);

  return (
    <Card
      title="היום"
      action={
        <Link href="/rega" className="text-sm text-eggshell/70 underline-offset-4 hover:text-eggshell hover:underline">
          לכל השבוע
        </Link>
      }
    >
      {rows.length === 0 ? (
        <p className="text-eggshell/70">אין שום דבר מתוכנן להיום.</p>
      ) : (
        <ol className="flex flex-col">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center gap-3 py-2">
              <span className="w-12 shrink-0 text-sm tabular-nums text-eggshell/70">{row.time}</span>
              <span aria-hidden="true" className={`size-2.5 shrink-0 ${dotClass(row)}`} />
              <span className={`min-w-0 flex-1 truncate ${textClass(row)}`}>{row.title}</span>
              {row.tag && <span className="shrink-0 text-xs text-eggshell/70">{row.tag}</span>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}