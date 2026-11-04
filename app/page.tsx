"use client";

import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";

export default function HomePage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader />
        <section className="glass mt-8 rounded-3xl p-8 motion-safe:animate-rise">
          <h2 className="text-lg font-bold">מסך הבית</h2>
          <p className="mt-2 text-eggshell/70">כאן ייבנו הכרטיסים: עכשיו, היום, משימות, יומן ו-EAGLE.</p>
        </section>
      </PanelShell>
    </RequireAuth>
  );
}