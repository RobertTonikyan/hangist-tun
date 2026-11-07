import { dayLabel, weekdayLetter } from "@/lib/dates";
import type { DayEvent, Exam, StudySession, Task } from "@/lib/types";

type Props = {
  date: string;
  today: string;
  events: DayEvent[];
  exams: Exam[];
  sessions: StudySession[];
  tasks: Task[];
};

// שורה אחת ביומן: אירוע או זמן למידה, לפי שעה
type TimedItem =
  | { kind: "event"; start: string; end: string; item: DayEvent }
  | { kind: "study"; start: string; end: string; item: StudySession };

function dayNumber(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return `${day}.${month}`;
}

export default function DayColumn({ date, today, events, exams, sessions, tasks }: Props) {
  const isToday = date === today;
  const isPast = date < today;

  const timed: TimedItem[] = [
    ...events.map((item): TimedItem => ({ kind: "event", start: item.start, end: item.end, item })),
    ...sessions.map((item): TimedItem => ({ kind: "study", start: item.start, end: item.end, item })),
  ].sort((a, b) => a.start.localeCompare(b.start));

  const empty = timed.length === 0 && exams.length === 0 && tasks.length === 0;

  return (
    <section
      aria-label={dayLabel(date, today)}
      className={`glass flex min-h-40 flex-col rounded-3xl p-4 ${isToday ? "ring-2 ring-eggshell/50" : ""} ${isPast ? "opacity-60" : ""}`}
    >
      <header className="flex items-baseline justify-between gap-2">
        <p className={`text-lg font-bold ${isToday ? "text-eggshell" : "text-eggshell/85"}`}>
          {weekdayLetter(date)} <span className="text-sm font-medium text-eggshell/60 tabular-nums">{dayNumber(date)}</span>
        </p>
        {isToday && <span className="rounded-full bg-eggshell px-2 py-0.5 text-[11px] font-bold text-ink">היום</span>}
      </header>

      <div className="mt-3 flex flex-1 flex-col gap-2">
        {exams.map((exam) => (
          <p
            key={exam.id}
            className={`rounded-xl px-3 py-2 text-sm font-bold ${exam.type === "exam" ? "bg-rust/40 text-eggshell" : "bg-denim/30 text-eggshell"}`}
          >
            {exam.type === "exam" ? "מבחן" : "הגשה"} · {exam.course}
          </p>
        ))}

        {tasks.map((task) => (
          <p key={task.id} className="rounded-xl border border-eggshell/20 px-3 py-2 text-sm">
            <span className="text-eggshell/60">{task.isPromise ? "הבטחה" : "משימה"}</span> · {task.title}
            {task.dueTime && <span className="text-eggshell/60 tabular-nums"> · עד {task.dueTime}</span>}
          </p>
        ))}

        {timed.map((entry) =>
          entry.kind === "event" ? (
            <div
              key={`e-${entry.item.id}`}
              className={`rounded-xl px-3 py-2 ${entry.item.status === "tentative" ? "border border-dashed border-eggshell/30" : "bg-eggshell/10"}`}
            >
              <p className="text-xs text-eggshell/60 tabular-nums" dir="ltr">
                {entry.start}–{entry.end}
              </p>
              <p className={`text-sm font-medium ${entry.item.progress === "done" ? "line-through opacity-60" : ""}`}>{entry.item.title}</p>
              {entry.item.location && <p className="truncate text-xs text-eggshell/60">{entry.item.location}</p>}
              {entry.item.status === "tentative" && <p className="text-xs text-eggshell/60">לא סופי</p>}
            </div>
          ) : (
            <div key={`s-${entry.item.id}`} className="rounded-xl border-s-4 border-denim bg-denim/15 px-3 py-2">
              <p className="text-xs text-eggshell/60 tabular-nums" dir="ltr">
                {entry.start}–{entry.end}
              </p>
              <p className={`text-sm font-medium ${entry.item.status === "done" ? "line-through opacity-60" : ""}`}>
                למידה · {entry.item.course}
              </p>
            </div>
          ),
        )}

        {empty && <p className="text-sm text-eggshell/50">פנוי</p>}
      </div>
    </section>
  );
}