"use client";

import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";

export default function JournalPage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader title="יומן" />
        <section className="glass mt-8 rounded-3xl p-8 motion-safe:animate-rise">
          <p className="text-eggshell/70">כאן ייבנה היומן היומי.</p>
        </section>
      </PanelShell>
    </RequireAuth>
  );
}