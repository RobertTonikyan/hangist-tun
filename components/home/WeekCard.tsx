"use client";

import Card from "./Card";
import { useWeekData } from "./useWeekData";
import { weekLoad } from "@/lib/week-load";
import { addDays, daysBetween, dayLabel, weekdayLetter } from "@/lib/dates";
import type { Task } from "@/lib/types";

type Props = { tasks: Task[]; today: string };

export default function WeekCard({ tasks, today }: Props) {
  const state = useWeekData(today);

  if (state.status === "loading") {
    return (
      <Card title="השבוע הקרוב">
        <p className="text-eggshell/60 motion-safe:animate-pulse">טוען...</p>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card title="השבוע הקרוב">
        <p className="text-rust-light">לא הצלחתי לטעון את השבוע</p>
      </Card>
    );
  }

  const { eventDates, exams, limit } = state.data;
  const days = weekLoad(today, eventDates, exams, tasks, limit);
  const heavy = days.filter((day) => day.overloaded);
  const top = Math.max(limit, ...days.map((day) => day.count));
  const weekEnd = addDays(today, 6);

  return (
    <Card title="השבוע הקרוב">
      <p className="text-xl font-bold">
        {heavy.length === 0 ? "שבוע רגוע" : heavy.length === 1 ? "יום עמוס אחד" : `${heavy.length} ימים עמוסים`}
      </p>
      <p className="text-sm text-eggshell/70">עמוס = {limit} דברים ומעלה ביום</p>

      <div
        className="mt-4 flex h-28 items-end gap-1.5"
        role="img"
        aria-label={days.map((day) => `${dayLabel(day.date, today)}: ${day.count}`).join(", ")}
      >
        {days.map((day) => {
          const height = day.count === 0 ? 6 : Math.max(12, (day.count / top) * 100);
          const color = day.overloaded ? "bg-rust-light" : day.count === 0 ? "bg-eggshell/10" : "bg-denim";
          return (
            <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[11px] text-eggshell/70 tabular-nums">{day.count || ""}</span>
              <span className={`w-full rounded-lg ${color}`} style={{ height: `${height}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1.5">
        {days.map((day) => (
          <span key={day.date} className={`flex-1 text-center text-[11px] ${day.date === today ? "font-bold text-eggshell" : "text-eggshell/70"}`}>
            {weekdayLetter(day.date)}
          </span>
        ))}
      </div>

      <div className="mt-5 border-t border-eggshell/10 pt-4">
        <p className="text-sm text-eggshell/70">מבחנים והגשות בשבועיים הקרובים</p>
        {exams.length === 0 ? (
          <p className="mt-1 text-eggshell/60">אין</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {exams.map((exam) => {
              const inDays = daysBetween(today, exam.date);
              return (
                <li key={exam.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">
                    <span className={exam.type === "exam" ? "text-rust-light" : "text-denim"}>
                      {exam.type === "exam" ? "מבחן" : "הגשה"}
                    </span>{" "}
                    · {exam.course}
                  </span>
                  <span className={`shrink-0 text-sm tabular-nums ${exam.date <= weekEnd ? "text-eggshell" : "text-eggshell/60"}`}>
                    {inDays <= 2 ? dayLabel(exam.date, today) : `בעוד ${inDays} ימים`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}