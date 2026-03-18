"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStorage } from "@/app/lib/storage";

const today = new Date().toISOString().split("T")[0];

const HOW_TO_PLAY = [
  { step: "01", text: "Each puzzle shows you a set of category clues about a current news topic." },
  { step: "02", text: "Type your guess — it could be a person, place, event, or trend." },
  { step: "03", text: "You get 3 attempts. Guess in 1 for 3pts, 2 for 2pts, 3 for 1pt." },
  { step: "04", text: "After each puzzle, read a summary and learn something new." },
  { step: "05", text: "Complete all 10 puzzles to get your daily score." },
];

export default function LandingPage() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);

  useEffect(() => {
    const storage = getStorage();
    setStreak(storage.streak);
    setTotalScore(storage.totalScore);
    setPlayedToday(!!storage.history[today]);
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <div className="mb-10 border-b-4 pb-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between items-end">
          <h1
            className="text-8xl leading-none"
            style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}
          >
            Deasil
          </h1>
          <button
            onClick={() => router.push("/archive")}
            className="text-xs uppercase tracking-widest underline mb-2"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Archive →
          </button>
        </div>
        <p className="text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          Daily news puzzle — {today}
        </p>
      </div>

      {/* Stats (returning users) */}
      {totalScore > 0 && (
        <div className="grid grid-cols-2 gap-0 mb-10 border-2" style={{ borderColor: 'var(--color-border)' }}>
          {[
            { label: "Streak", value: `${streak} 🔥` },
            { label: "All Time", value: totalScore },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-6 text-center"
              style={{
                borderRight: i === 0 ? `2px solid var(--color-border)` : 'none',
                backgroundColor: 'var(--color-bg2)',
              }}
            >
              <p className="text-4xl font-bold mb-1" style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-accent)' }}>
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Play today CTA */}
      <button
        onClick={() => router.push(`/play/${today}`)}
        className="w-full py-5 mb-10 border-2 font-bold uppercase tracking-widest text-lg transition-all"
        style={{
          borderColor: 'var(--color-bright)',
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-bg)',
          fontFamily: 'var(--font-syne)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-bright)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
      >
        {playedToday ? "Today's Result →" : "Play Today's Puzzle →"}
      </button>

      {/* How to play */}
      <div>
        <h2
          className="text-3xl mb-6 pb-3 border-b-2"
          style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)', borderColor: 'var(--color-border)' }}
        >
          How to Play
        </h2>
        <div className="flex flex-col gap-3">
          {HOW_TO_PLAY.map(({ step, text }) => (
            <div
              key={step}
              className="flex gap-4 items-start p-4 border-2"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg2)' }}
            >
              <span
                className="text-2xl font-bold shrink-0"
                style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-accent)' }}
              >
                {step}
              </span>
              <p
                className="text-sm leading-relaxed pt-1"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}