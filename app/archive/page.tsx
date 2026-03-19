"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStorage } from "@/app/lib/storage";
import { getToday } from "@/app/lib/date";

import NavButton from "@/app/components/NavButton";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["S","M","T","W","T","F","S"];

export default function ArchivePage() {
  const router = useRouter();
  const [dates, setDates] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, { totalScore: number }>>({});
  const today = getToday();
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const storage = getStorage();
    setHistory(storage.history);
    fetch("/api/puzzles")
      .then((r) => r.json())
      .then((data) => setDates(data.dates));
  }, []);

  const datesSet = new Set(dates);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const isNextDisabled = viewYear === new Date().getFullYear() && viewMonth === new Date().getMonth();

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <div className="mb-8 border-b-4 pb-4 md:pb-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between items-end">
          <h1 className="text-6xl md:text-8xl leading-none" style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}>
            Archive
          </h1>
          <NavButton onClick={() => router.push("/")} direction="left">
            ← Home
          </NavButton>
        </div>
        <p className="text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          All past puzzles
        </p>
      </div>

      {/* Month navigation */}
      <div
        className="flex justify-between items-center px-4 py-3 border-2 mb-0"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bright)' }}
      >
        <button
          onClick={prevMonth}
          className="text-xs uppercase tracking-widest transition-all p-1"
          style={{ color: 'var(--color-bg)', fontFamily: 'var(--font-mono)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-bg)')}
        >
          ← Prev
        </button>
        <span className="text-base md:text-xl uppercase tracking-widest" style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bg)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          disabled={isNextDisabled}
          className="text-xs uppercase tracking-widest transition-all disabled:opacity-30 p-1"
          style={{ color: 'var(--color-bg)', fontFamily: 'var(--font-mono)' }}
          onMouseEnter={e => !isNextDisabled && (e.currentTarget.style.color = 'var(--color-accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-bg)')}
        >
          Next →
        </button>
      </div>

      {/* Calendar */}
      <div className="border-2 border-t-0" style={{ borderColor: 'var(--color-border)' }}>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b-2" style={{ borderColor: 'var(--color-border)' }}>
          {DAYS.map((d, i) => (
            <div
              key={i}
              className="text-center py-2 text-xs uppercase tracking-widest"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square"
              style={{ backgroundColor: 'var(--color-bg2)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasPuzzle = datesSet.has(dateStr);
            const completed = !!history[dateStr];
            const isToday = dateStr === today;
            const isFuture = dateStr > today;

            let bg = 'var(--color-bg)';
            if (completed) bg = 'var(--color-accent)';
            if (isToday && !completed) bg = 'var(--color-surface)';

            return (
              <div
                key={day}
                onClick={() => hasPuzzle && !isFuture && router.push(`/play/${dateStr}?from=archive`)}
                className="aspect-square flex flex-col items-center justify-center relative transition-colors"
                style={{
                  backgroundColor: bg,
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: hasPuzzle && !isFuture ? 'pointer' : 'default',
                  opacity: isFuture ? 0.25 : 1,
                }}
                onMouseEnter={e => { if (hasPuzzle && !isFuture) e.currentTarget.style.opacity = '0.75'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = isFuture ? '0.25' : '1'; }}
              >
                <span
                  className="text-xs md:text-sm font-bold"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    color: completed ? 'var(--color-bg)' : hasPuzzle ? 'var(--color-bright)' : 'var(--color-border)',
                  }}
                >
                  {day}
                </span>

                {/* Completed — show score on md+ only */}
                {completed && (
                  <span
                    className="hidden md:block font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-bg)', fontSize: '10px' }}
                  >
                    {history[dateStr].totalScore}pt
                  </span>
                )}

                {/* Has puzzle but not done — small dot */}
                {hasPuzzle && !completed && !isFuture && (
                  <span className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: 'var(--color-accent)' }} />
                )}

                {/* Today indicator — hidden on mobile to save space */}
                {isToday && (
                  <span
                    className="hidden md:block absolute top-1 right-1"
                    style={{ color: 'var(--color-accent)', fontSize: '8px', fontFamily: 'var(--font-mono)' }}
                  >
                    TODAY
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-4 mt-4 px-4 py-3 border-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg2)' }}
      >
        {[
          { bg: 'var(--color-accent)', label: 'Completed', textColor: 'var(--color-bg)' },
          { bg: 'var(--color-bg)', label: 'Not played', dot: true },
          { bg: 'var(--color-bg)', label: 'No puzzle', textColor: 'var(--color-border)' },
        ].map(({ bg, label, dot, textColor }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-5 h-5 border flex items-center justify-center shrink-0"
              style={{ backgroundColor: bg, borderColor: 'var(--color-border)' }}
            >
              {dot && <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />}
              {!dot && <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-syne)', color: textColor, fontSize: '9px' }}>1</span>}
            </div>
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

    </main>
  );
}