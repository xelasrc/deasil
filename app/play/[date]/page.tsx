"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DailyPuzzle } from "@/app/types/puzzle";
import { getStorage, saveDayHistory, getTodayHistory, saveProgress, getProgress, clearProgress } from "@/app/lib/storage";

import PuzzleCard from "@/app/components/PuzzleCard";
import ProgressBar from "@/app/components/ProgressBar";
import ScoreBoard from "@/app/components/ScoreBoard";
import NavButton from "@/app/components/NavButton";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = params.date as string;
  const from = searchParams.get("from") ?? "home";

  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayScore, setTodayScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [attempts, setAttempts] = useState<{ points: number; attempts: number; solved: boolean; wrongGuesses: string[] }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    async function loadPuzzle() {
      try {
        const data = await import(`../../../puzzles/${date}.json`);
        setPuzzle(data as DailyPuzzle);
      } catch {
        router.push("/");
        return;
      }

      const storage = getStorage();
      setStreak(storage.streak);
      setTotalScore(storage.totalScore);

      const today = getTodayHistory(date);
      if (today) {
        setFinished(true);
        setTodayScore(today.totalScore);
        setAttempts(today.puzzles.map((p) => ({
          points: p.points,
          attempts: p.attempts,
          solved: p.solved,
          wrongGuesses: p.wrongGuesses ?? [],
        })));
      } else {
        // Restore mid-game progress if it exists
        const progress = getProgress(date);
        if (progress) {
          setCurrentIndex(progress.currentIndex);
          setCompletedCount(progress.completedCount);
          setTodayScore(progress.todayScore);
          setAttempts(progress.attempts);
        }
      }

      setLoading(false);
    }
    loadPuzzle();
  }, [date, router]);

  function handlePuzzleComplete(points: number, numAttempts: number, solved: boolean, wrongGuesses: string[]) {
    if (!puzzle) return;
    const newAttempts = [...attempts, { points, attempts: numAttempts, solved, wrongGuesses }];
    setAttempts(newAttempts);

    if (currentIndex + 1 >= puzzle.puzzles.length) {
      const finalScore = newAttempts.reduce((sum, a) => sum + a.points, 0);
      const history = {
        totalScore: finalScore,
        puzzles: newAttempts.map((a, i) => ({
          id: puzzle.puzzles[i].id,
          solved: a.solved,
          attempts: a.attempts,
          points: a.points,
          skipped: !a.solved,
          wrongGuesses: a.wrongGuesses,
        })),
      };
      saveDayHistory(date, history);
      clearProgress(date);
      const storage = getStorage();
      setStreak(storage.streak);
      setTotalScore(storage.totalScore);
      setFinished(true);
    } else {
      const nextIndex = currentIndex + 1;
      const newScore = newAttempts.reduce((sum, a) => sum + a.points, 0);
      saveProgress(date, {
        currentIndex: nextIndex,
        completedCount: completedCount + 1,
        todayScore: newScore,
        attempts: newAttempts,
      });
      setCurrentIndex(nextIndex);
    }
  }

  function handleShare() {
    if (!puzzle) return;
    const text = `Deasil ${date}\nScore: ${todayScore}/${puzzle.puzzles.length * 3}\nStreak: ${streak} 🔥`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  if (loading || !puzzle) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <div className="mb-6 md:mb-10 border-b-4 pb-4 md:pb-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between items-end">
          <h1
            className="text-6xl md:text-8xl leading-none"
            style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}
          >
            Deasil
          </h1>
          <NavButton
            onClick={() => router.push(from === "archive" ? "/archive" : "/")}
            direction="left"
          >
            ← {from === "archive" ? "Archive" : "Home"}
          </NavButton>
        </div>
        <p className="text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          Daily News Puzzle — {date}
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
            onAttempt={(currentWrongGuesses) => {
              saveProgress(date, {
                currentIndex,
                completedCount,
                todayScore,
                attempts: [...attempts, {
                  points: 0,
                  attempts: currentWrongGuesses.length,
                  solved: false,
                  wrongGuesses: currentWrongGuesses,
                }],
              });
            }}
            onDone={(points, numAttempts, solved, wrongGuesses) => {
              const newCompletedCount = completedCount + 1;
              const newScore = todayScore + points;
              const newAttempt = { points, attempts: numAttempts, solved, wrongGuesses };
              setCompletedCount(newCompletedCount);
              setTodayScore(newScore);
              saveProgress(date, {
                currentIndex,
                completedCount: newCompletedCount,
                todayScore: newScore,
                attempts: [...attempts, newAttempt],
              });
            }}
            onComplete={handlePuzzleComplete}
          />
        </>
      ) : (
        <ScoreBoard
          score={todayScore}
          onShare={handleShare}
          puzzles={puzzle.puzzles}
          attempts={attempts}
        />
      )}
    </main>
  );
}