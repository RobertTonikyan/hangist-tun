export const field =
  "mt-1.5 h-12 w-full rounded-xl border border-eggshell/15 bg-ink/50 px-4 placeholder:text-eggshell/40 outline-none transition focus:border-eggshell/60 focus:ring-4 focus:ring-eggshell/10";

export const primaryButton =
  "h-12 rounded-full bg-eggshell px-8 font-semibold text-ink transition hover:bg-white active:scale-[0.98] disabled:opacity-60";

export function choiceClass(selected: boolean) {
  return `rounded-2xl border transition ${
    selected ? "border-eggshell bg-eggshell text-ink" : "border-eggshell/20 bg-eggshell/5 hover:bg-eggshell/10"
  }`;
}