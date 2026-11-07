import type { ReactNode } from "react";

export default function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={title} className="glass h-full rounded-3xl p-6 motion-safe:animate-rise">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-eggshell/70">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}