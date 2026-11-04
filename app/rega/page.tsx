"use client";

import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";

export default function RegaPage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader title="Rega" />
        <section className="glass mt-8 rounded-3xl p-8 motion-safe:animate-rise">
          <p className="text-eggshell/70">כאן תיבנה תצוגת השבוע.</p>
        </section>
      </PanelShell>
    </RequireAuth>
  );
}