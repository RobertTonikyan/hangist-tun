"use client";

import { useState } from "react";
import Card from "./Card";
import { setTaskDone } from "@/lib/db/tasks";
import { dayLabel } from "@/lib/dates";
import type { Task } from "@/lib/types";

const MAX_SHOWN = 6;

type Props = {
  tasks: Task[];
  today: string;
  onChanged: () => Promise<void>;
};

function meta(task: Task, today: string) {
  const parts: string[] = [];
  if (task.isPromise) parts.push(task.promisedTo ? `הבטחה ל${task.promisedTo}` : "הבטחה");
  if (task.dueDate) parts.push(dayLabel(task.dueDate, today));
  return parts.join(" · ");
}

export default function TasksCard({ tasks, today, onChanged }: Props) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // שומרים, מחכים לאישור מהמסד, ורק אז טוענים מחדש. המשימה נעלמת רק אחרי שבאמת נשמרה.
  async function complete(task: Task) {
    setSavingId(task.id);
    setError(null);
    try {
      await setTaskDone(task.id, true);
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setSavingId(null);
    }
  }

  const shown = tasks.slice(0, MAX_SHOWN);

  return (
    <Card title="משימות והבטחות">
      {tasks.length === 0 ? (
        <p className="text-eggshell/70">אין משימות פתוחות.</p>
      ) : (
        <ul className="flex flex-col">
          {shown.map((task) => {
            const saving = savingId === task.id;
            const overdue = task.dueDate !== null && task.dueDate < today;
            return (
              <li key={task.id} className="flex min-h-11 items-center gap-3">
                <input
                  id={`task-${task.id}`}
                  type="checkbox"
                  checked={saving}
                  disabled={savingId !== null}
                  onChange={() => complete(task)}
                  className="size-5 shrink-0 cursor-pointer accent-eggshell"
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`min-w-0 flex-1 cursor-pointer truncate ${saving ? "text-eggshell/50 line-through" : ""}`}
                >
                  {task.title}
                </label>
                <span className={`shrink-0 text-xs ${overdue ? "text-rust-light" : "text-eggshell/70"}`}>{meta(task, today)}</span>
              </li>
            );
          })}
        </ul>
      )}

      {tasks.length > shown.length && <p className="mt-2 text-sm text-eggshell/60">ועוד {tasks.length - shown.length}</p>}

      {error && (
        <p role="alert" className="mt-3 text-sm text-rust-light">
          לא הצלחתי לשמור: {error}
        </p>
      )}
    </Card>
  );
}