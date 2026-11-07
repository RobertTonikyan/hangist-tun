"use client";

import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";
import NextCard from "@/components/home/NextCard";
import TodayCard from "@/components/home/TodayCard";
import TasksCard from "@/components/home/TasksCard";
import JournalCard from "@/components/home/JournalCard";
import { useHomeData } from "@/components/home/useHomeData";
import { useClock } from "@/components/useClock";

function Home() {
  const clock = useClock();
  const { state, retry, refresh } = useHomeData(clock?.today);

  if (!clock || state.status === "loading") {
    return <p className="mt-8 text-eggshell/60 motion-safe:animate-pulse">טוען...</p>;
  }

  if (state.status === "error") {
    return (
      <div className="glass mt-8 max-w-xl rounded-3xl p-6">
        <p className="font-bold text-rust-light">לא הצלחתי לטעון את הנתונים</p>
        <p className="mt-1 text-sm text-eggshell/60" dir="ltr">
          {state.message}
        </p>
        <button type="button" onClick={retry} className="mt-4 h-11 rounded-full border border-eggshell/30 px-5 transition hover:bg-eggshell/10">
          לנסות שוב
        </button>
      </div>
    );
  }

  const { events, tasks, journalDates } = state.data;

  return (
    <div className="mt-8 grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-5">
        <NextCard events={events} minutes={clock.minutes} />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <TodayCard events={events} tasks={tasks} today={clock.today} minutes={clock.minutes} />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-3">
        <JournalCard journalDates={journalDates} today={clock.today} />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <TasksCard tasks={tasks} today={clock.today} onChanged={refresh} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader />
        <Home />
      </PanelShell>
    </RequireAuth>
  );
}