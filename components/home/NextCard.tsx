import CountdownRing from "./CountdownRing";
import Card from "./Card";
import { leaveAt, nextEvent } from "@/lib/next-event";
import { formatTime } from "@/lib/dates";
import { toMinutes } from "@/lib/time";
import type { DayEvent } from "@/lib/types";

// ברירת המחדל של Rega. בהמשך נקרא את זה מטבלת ההגדרות.
const PREP_MINUTES = 10;
const REGA_URL = "http://localhost:3000";

export default function NextCard({ events, minutes }: { events: DayEvent[]; minutes: number }) {
  const next = nextEvent(events, minutes);

  if (!next) {
    return (
      <Card title="הדבר הבא">
        <p className="text-xl font-bold">אין עוד אירועים היום</p>
        <p className="mt-1 text-eggshell/70">מכאן והלאה היום פנוי.</p>
        <a
          href={`${REGA_URL}/add`}
          className="mt-5 inline-flex h-11 items-center rounded-full bg-eggshell px-5 font-semibold text-ink transition hover:bg-white"
        >
          להוסיף אירוע ב-Rega
        </a>
      </Card>
    );
  }

  const leave = leaveAt(next, PREP_MINUTES);
  const ongoing = minutes >= toMinutes(next.start);

  return (
    <Card title="הדבר הבא">
      <div className="flex flex-wrap items-center gap-6">
        <CountdownRing minutesLeft={ongoing ? 0 : leave - minutes} />
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-bold">{next.title}</h3>
          <p className="mt-1 text-eggshell/70">
            {next.start}–{next.end}
            {next.location && ` · ${next.location}`}
          </p>
          <p className="mt-3 text-sm text-eggshell/70">
            {ongoing ? `מתקיים עכשיו, עד ${next.end}` : `לצאת ב-${formatTime(leave)}`}
            {!ongoing && next.travelMinutes > 0 && ` · ${next.travelMinutes} דק׳ נסיעה`}
          </p>
          {next.status === "tentative" && (
            <span className="mt-3 inline-block rounded-full border border-eggshell/30 px-3 py-1 text-xs">בבדיקה</span>
          )}
        </div>
      </div>
    </Card>
  );
}