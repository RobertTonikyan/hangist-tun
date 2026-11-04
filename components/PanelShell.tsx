import type { ReactNode } from "react";
import PanelRail from "./PanelRail";
import SeasonEffect from "./SeasonEffect";

export default function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden="true" className="fixed inset-0 bg-[url(/ararat.jpg)] bg-cover bg-center" />
      <div aria-hidden="true" className="fixed inset-0 bg-linear-to-b from-ink/60 via-ink/25 to-ink/70" />
      <div aria-hidden="true" className="fixed inset-0">
        <SeasonEffect />
      </div>

      <PanelRail />

      <div className="relative mx-auto max-w-360 px-6 pt-8 pb-28 md:ps-32 md:pb-10">{children}</div>
    </div>
  );
}