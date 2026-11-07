// העיגול מותאם לזמן שנשאר: עד שעה, שעתיים, 3, 6, 12 שעות או יממה.
// ככה הוא אף פעם לא מלא לגמרי, ומתרוקן ככל שמתקרבים ליציאה.
const scales = [60, 120, 180, 360, 720, 1440];

function label(minutesLeft: number) {
  if (minutesLeft <= 0) return "לצאת";
  if (minutesLeft < 60) return `${minutesLeft} דק׳`;
  return `${Math.floor(minutesLeft / 60)}:${String(minutesLeft % 60).padStart(2, "0")}`;
}

export default function CountdownRing({ minutesLeft }: { minutesLeft: number }) {
  const left = Math.max(minutesLeft, 0);
  const scale = scales.find((s) => left <= s) ?? 1440;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (left / scale);

  return (
    <div className="relative size-36 shrink-0">
      <svg viewBox="0 0 132 132" className="size-full -rotate-90" role="img" aria-label={`${left} דקות עד היציאה`}>
        <circle cx="66" cy="66" r={radius} fill="none" strokeWidth="8" className="stroke-eggshell/15" />
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="stroke-eggshell transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{label(left)}</span>
        {left > 0 && <span className="text-xs text-eggshell/70">עד היציאה</span>}
      </div>
    </div>
  );
}