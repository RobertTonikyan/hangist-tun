"use client";

import { useAuth } from "./AuthProvider";

// "Robert Tonikyan" → "RT"
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({ size = 44 }: { size?: number }) {
  const auth = useAuth();
  const meta = auth.status === "signed-in" ? auth.session.user.user_metadata : {};
  const name = typeof meta.full_name === "string" ? meta.full_name : "";
  const photo = typeof meta.avatar_url === "string" ? meta.avatar_url : "";

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- תמונה מ-Supabase, לא צריך את Image של Next כאן
      <img src={photo} alt={name || "תמונת פרופיל"} className="rounded-full object-cover" style={{ width: size, height: size }} />
    );
  }

  return (
    <span
      className="flex items-center justify-center rounded-full border border-eggshell/30 bg-eggshell/10 text-sm font-bold tracking-wider"
      style={{ width: size, height: size }}
    >
      {name ? initials(name) : "HT"}
    </span>
  );
}