"use client";

import { useSyncExternalStore } from "react";

type Season = "winter" | "spring" | "summer" | "autumn";

// לבדיקה: כתוב כאן "winter", "spring", "summer" או "autumn".
// null = לפי התאריך של היום.
const TEST_SEASON: Season | null = null;

function seasonFor(date: Date): Season {
  const month = date.getMonth() + 1;
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "autumn";
}

function subscribe() {
  return () => {};
}
function getSeason(): Season | null {
  return TEST_SEASON ?? seasonFor(new Date());
}
function getServerSeason(): Season | null {
  return null;
}

// מספר "אקראי" בין 0 ל-1 שתמיד יוצא אותו דבר לאותו i.
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function Rain() {
  return (
    <>
      {Array.from({ length: 90 }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 h-20 w-px bg-linear-to-b from-transparent to-eggshell/40"
          style={{
            left: `${rand(i, 1) * 110 - 5}%`,
            animation: `rain ${0.6 + rand(i, 2) * 0.5}s linear ${-rand(i, 3) * 2}s infinite`,
          }}
        />
      ))}
    </>
  );
}

const leafColors = ["#a8432c", "#e8a48f", "#d4a25a", "#8a5a2b"];

function Leaves() {
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => {
        const size = 10 + rand(i, 1) * 12;
        return (
          <span
            key={i}
            className="absolute top-0 rounded-[0_100%] opacity-85"
            style={{
              left: `${rand(i, 2) * 100}%`,
              width: size,
              height: size * 0.7,
              background: leafColors[i % leafColors.length],
              animation: `fall-sway ${10 + rand(i, 3) * 8}s linear ${-rand(i, 4) * 18}s infinite`,
            }}
          />
        );
      })}
    </>
  );
}

const petalColors = ["#f6c9d4", "#fbe4ea", "#f0b3c3"];

function Blossoms() {
  return (
    <>
      {Array.from({ length: 26 }, (_, i) => {
        const size = 7 + rand(i, 1) * 5;
        return (
          <span
            key={i}
            className="absolute top-0 rounded-[100%_0] opacity-90"
            style={{
              left: `${rand(i, 2) * 100}%`,
              width: size,
              height: size,
              background: petalColors[i % petalColors.length],
              animation: `fall-sway ${12 + rand(i, 3) * 8}s linear ${-rand(i, 4) * 20}s infinite`,
            }}
          />
        );
      })}
    </>
  );
}

function Fireflies() {
  return (
    <>
      {Array.from({ length: 22 }, (_, i) => {
        const size = 3 + rand(i, 1) * 2;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-[#f6e7a8] shadow-[0_0_10px_3px_rgba(246,231,168,0.6)]"
            style={{
              left: `${rand(i, 2) * 100}%`,
              top: `${30 + rand(i, 3) * 65}%`,
              width: size,
              height: size,
              animation: `firefly ${5 + rand(i, 4) * 4}s ease-in-out ${-rand(i, 5) * 9}s infinite`,
            }}
          />
        );
      })}
    </>
  );
}

export default function SeasonEffect() {
  const season = useSyncExternalStore(subscribe, getSeason, getServerSeason);
  if (!season) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      {season === "winter" && <Rain />}
      {season === "spring" && <Blossoms />}
      {season === "summer" && <Fireflies />}
      {season === "autumn" && <Leaves />}
    </div>
  );
}