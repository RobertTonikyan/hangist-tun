import { addDays } from "./dates";
import type { Exam, Task } from "./types";

export type DayLoad = { date: string; count: number; overloaded: boolean };

// לכל אחד מ-7 הימים הקרובים: כמה דברים יש בו.
// אירוע = 1, משימה פתוחה עם תאריך = 1, הגשה = 2, מבחן = 4 (כמו המשקלות ב-Rega).
const examWeight = { exam: 4, assignment: 2 };

export function weekLoad(today: string, eventDates: string[], exams: Exam[], tasks: Task[], limit: number): DayLoad[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const events = eventDates.filter((d) => d === date).length;
    const dueTasks = tasks.filter((task) => !task.done && task.dueDate === date).length;
    const examPoints = exams.filter((exam) => exam.date === date).reduce((sum, exam) => sum + examWeight[exam.type], 0);
    const count = events + dueTasks + examPoints;
    return { date, count, overloaded: count >= limit };
  });
}