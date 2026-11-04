"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const items = [
  { href: "/", label: "בית", icon: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" /> },
  {
    href: "/rega",
    label: "Rega",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    href: "/journal",
    label: "יומן",
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
        <path d="M4 19.5V21h16" />
      </>
    ),
  },
  {
    href: "/eagle",
    label: "EAGLE",
    icon: (
      <>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </>
    ),
  },
];

const button = "flex size-12 items-center justify-center rounded-full transition";
const idle = "text-eggshell/70 hover:bg-eggshell/10 hover:text-eggshell";

export default function PanelRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ניווט ראשי"
      className="glass fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full p-2 md:top-1/2 md:right-6 md:bottom-auto md:left-auto md:translate-x-0 md:-translate-y-1/2 md:flex-col md:px-3 md:py-4"
    >
      <Link href="/" aria-label="Hangist Tun" className="hidden h-10 w-12 items-center justify-center text-sm font-bold tracking-wider md:flex">
        HT
      </Link>

      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`${button} ${active ? "bg-eggshell text-ink" : idle}`}
          >
            <Icon>{item.icon}</Icon>
          </Link>
        );
      })}

      <span aria-hidden="true" className="mx-1 h-8 w-px bg-eggshell/15 md:mx-0 md:my-1 md:h-px md:w-8" />

      <button type="button" aria-label="התנתקות" onClick={() => supabase.auth.signOut()} className={`${button} ${idle}`}>
        <Icon>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </Icon>
      </button>
    </nav>
  );
}