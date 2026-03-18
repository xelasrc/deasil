"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStorage } from "@/app/lib/storage";

// Manually list available puzzle dates — we'll automate this later
const AVAILABLE_DATES = [
  "2026-03-18",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function ArchivePage() {
  const router = useRouter();
  const [history, setHistory] = useState<Record<string, { totalScore: number }>>({});
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const storage = getStorage();
    setHistory(storage.history);
  }, []);

  const sorted = [...AVAILABLE_DATES].sort((a, b) => b.localeCompare(a));

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <div className="mb-10 border-b-4 pb-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between items-end">
          <h1
            className="text-8xl leading-none"
            style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}
          >
            Archive
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-xs uppercase tracking-widest underline mb-2"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
          >
            ← Home
          </button>
        </div>
        <p className="text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          All past puzzles
        </p>
      </div>

      {/* Puzzle list */}
      <div className="flex flex-col gap-3">
        {sorted.map((date) => {
          const completed = !!history[date];
          const score = history[date]?.totalScore;
          const isToday = date === today;

          return (
            <button
              key={date}
              onClick={() => router.push(`/play/${date}`)}
              className="w-full flex justify-between items-center p-4 border-2 text-left transition-all"
              style={{
                borderColor: completed ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: completed ? 'var(--color-bg2)' : 'var(--color-bg)',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = completed ? 'var(--color-bg2)' : 'var(--color-bg)')}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-xs w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: completed ? 'var(--color-accent)' : 'var(--color-border)' }}
                />
                <div>
                  <span
                    className="text-sm font-medium uppercase tracking-widest block"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
                  >
                    {formatDate(date)} {isToday && <span style={{ color: 'var(--color-accent)' }}>— Today</span>}
                  </span>
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                    {completed ? `Score: ${score}` : "Not played"}
                  </span>
                </div>
              </div>
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
              >
                {completed ? "✓ View Result →" : "Play →"}
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}