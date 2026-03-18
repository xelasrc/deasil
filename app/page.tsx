"use client";
import { useState, useEffect } from "react";
import puzzleData from "../puzzles/2026-03-18.json";
import { DailyPuzzle } from "@/app/types/puzzle";
import { getStorage, saveDayHistory, getTodayHistory } from "@/app/lib/storage";
import PuzzleCard from "@/app/components/PuzzleCard";
import ProgressBar from "@/app/components/ProgressBar";
import ScoreBoard from "@/app/components/ScoreBoard";

const puzzle = puzzleData as DailyPuzzle;

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayScore, setTodayScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [attempts, setAttempts] = useState<{ points: number; attempts: number; solved: boolean }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const storage = getStorage();
    setStreak(storage.streak);
    setTotalScore(storage.totalScore);
    const today = getTodayHistory(puzzle.date);
    if (today) {
      setFinished(true);
      setTodayScore(today.totalScore);
    }
  }, []);

  function handlePuzzleComplete(points: number, numAttempts: number, solved: boolean) {
    const newAttempts = [...attempts, { points, attempts: numAttempts, solved }];
    setAttempts(newAttempts);

    if (currentIndex + 1 >= puzzle.puzzles.length) {
      const history = {
        totalScore: todayScore,
        puzzles: newAttempts.map((a, i) => ({
          id: puzzle.puzzles[i].id,
          solved: a.solved,
          attempts: a.attempts,
          points: a.points,
          skipped: !a.solved,
        })),
      };
      saveDayHistory(puzzle.date, history);
      const storage = getStorage();
      setStreak(storage.streak);
      setTotalScore(storage.totalScore);
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleShare() {
    const text = `Deasil ${puzzle.date}\nScore: ${todayScore}/${puzzle.puzzles.length * 3}\nStreak: ${streak} 🔥`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

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
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>
              Daily News Puzzle
            </p>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              {puzzle.date}
            </p>
          </div>
        </div>
        <p
          className="text-xs uppercase tracking-widest mt-2"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Guess the topic from the clues
        </p>
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="mt-2 text-xs underline uppercase tracking-widest"
            style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}
          >
            ↺ Reset (dev)
          </button>
        )}
      </div>

      {!finished ? (
        <>
          <ProgressBar
            current={completedCount}
            total={puzzle.puzzles.length}
            score={todayScore}
          />
          <PuzzleCard
            key={currentIndex}
            puzzle={puzzle.puzzles[currentIndex]}
            puzzleNumber={currentIndex + 1}
            totalPuzzles={puzzle.puzzles.length}
            onDone={(points) => {
              setCompletedCount((c) => c + 1);
              setTodayScore((s) => s + points);
            }}
            onComplete={handlePuzzleComplete}
          />
        </>
      ) : (
        <ScoreBoard score={todayScore} streak={streak} totalScore={totalScore} onShare={handleShare} />
      )}
    </main>
  );
}