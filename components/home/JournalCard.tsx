import Link from "next/link";
import Card from "./Card";
import { lastDays, streak } from "@/lib/streak";
import { weekdayLetter } from "@/lib/dates";

type Props = { journalDates: string[]; today: string };

export default function JournalCard({ journalDates, today }: Props) {
  const filled = new Set(journalDates);
  const filledToday = filled.has(today);
  const days = lastDays(today, 7);
  const filledThisWeek = days.filter((day) => filled.has(day)).length;
  const count = streak(journalDates, today);

  return (
    <Card title="יומן">
      <p className="text-xl font-bold">{filledToday ? "היום מולא" : "עוד לא מולא היום"}</p>

      <Link
        href="/journal"
        className={`mt-4 inline-flex h-11 items-center justify-center rounded-full px-5 font-semibold transition ${
          filledToday ? "border border-eggshell/30 hover:bg-eggshell/10" : "bg-eggshell text-ink hover:bg-white"
        }`}
      >
        {filledToday ? "לעדכן" : "למלא עכשיו"}
      </Link>

      <div className="mt-5">
        <p className="text-3xl font-bold tabular-nums">{count}</p>
        <p className="text-sm text-eggshell/70">{count === 1 ? "יום ברצף" : "ימים ברצף"}</p>
      </div>

      <div className="mt-4 flex gap-1.5" role="img" aria-label={`מילאת ${filledThisWeek} מתוך 7 הימים האחרונים`}>
        {days.map((day) => {
          const isToday = day === today;
          const style = filled.has(day)
            ? "bg-denim"
            : isToday
              ? "border-2 border-dashed border-eggshell/40"
              : "bg-eggshell/10";
          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <span className={`h-7 w-full rounded-lg ${style}`} />
              <span className="text-[11px] text-eggshell/70">{weekdayLetter(day)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}