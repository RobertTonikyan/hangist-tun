"use client";

import { useRef, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import PanelShell from "@/components/PanelShell";
import PanelHeader from "@/components/PanelHeader";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

type Message = { ok: boolean; text: string } | null;

function ProfileForm() {
  const auth = useAuth();
  const user = auth.status === "signed-in" ? auth.session.user : null;
  const savedName = typeof user?.user_metadata.full_name === "string" ? user.user_metadata.full_name : "";
  const hasPhoto = typeof user?.user_metadata.avatar_url === "string" && user.user_metadata.avatar_url !== "";

  const [name, setName] = useState(savedName);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setBusy(false);
    setMessage(error ? { ok: false, text: error.message } : { ok: true, text: "השם נשמר" });
  }

  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // כדי שאפשר יהיה לבחור שוב את אותו קובץ
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ ok: false, text: "צריך לבחור קובץ תמונה" });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage({ ok: false, text: "התמונה גדולה מ-2MB" });
      return;
    }

    setBusy(true);
    setMessage(null);

    // שם חדש בכל העלאה, כדי שהדפדפן לא יציג תמונה ישנה מהזיכרון
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
    if (uploadError) {
      setBusy(false);
      setMessage({ ok: false, text: uploadError.message });
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    setBusy(false);
    setMessage(error ? { ok: false, text: error.message } : { ok: true, text: "התמונה עודכנה" });
  }

  async function removePhoto() {
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: null } });
    setBusy(false);
    setMessage(error ? { ok: false, text: error.message } : { ok: true, text: "התמונה הוסרה" });
  }

  const ghost = "h-11 rounded-full border border-eggshell/30 px-5 transition hover:bg-eggshell/10 disabled:opacity-60";

  return (
    <section className="glass mt-8 max-w-xl rounded-3xl p-8 motion-safe:animate-rise">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar size={80} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">{savedName || "בלי שם עדיין"}</p>
          <p className="text-sm text-eggshell/70" dir="ltr">
            {user?.email}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => fileInput.current?.click()} disabled={busy} className={ghost}>
              {hasPhoto ? "להחליף תמונה" : "להעלות תמונה"}
            </button>
            {hasPhoto && (
              <button type="button" onClick={removePhoto} disabled={busy} className={ghost}>
                להסיר
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
        </div>
      </div>

      <form onSubmit={saveName} className="mt-8 flex flex-col gap-3">
        <label htmlFor="name" className="text-sm font-medium text-eggshell/80">
          שם מלא (ממנו נבנים ראשי התיבות, כשאין תמונה)
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Robert Tonikyan"
          className="h-12 rounded-xl border border-eggshell/15 bg-ink/50 px-4 placeholder:text-eggshell/40 outline-none transition focus:border-eggshell/60 focus:ring-4 focus:ring-eggshell/10"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-2 h-11 self-start rounded-full bg-eggshell px-6 font-semibold text-ink transition hover:bg-white disabled:opacity-60"
        >
          {busy ? "שומר..." : "לשמור שם"}
        </button>
      </form>

      {message && (
        <p role="status" className={`mt-4 text-sm ${message.ok ? "text-gain" : "text-rust-light"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <PanelShell>
        <PanelHeader title="פרופיל" />
        <ProfileForm />
      </PanelShell>
    </RequireAuth>
  );
}