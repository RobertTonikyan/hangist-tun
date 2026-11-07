"use client";

import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";
import NextCard from "@/components/home/NextCard";

export default function HomePage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader />
        <div className="mt-8 grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-5">
            <NextCard />
          </div>
        </div>
      </PanelShell>
    </RequireAuth>
  );
}