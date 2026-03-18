"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DailyPuzzle } from "@/app/types/puzzle";
import { getStorage, saveDayHistory, getTodayHistory } from "@/app/lib/storage";
import PuzzleCard from "@/app/components/PuzzleCard";
import ProgressBar from "@/app/components/ProgressBar";
import ScoreBoard from "@/app/components/ScoreBoard";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;

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
      const storage = getStorage();
      setStreak(storage.streak);
      setTotalScore(storage.totalScore);
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
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
          <button
            onClick={() => router.push("/")}
            className="text-xs uppercase tracking-widest underline mb-1 md:mb-2"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
          >
            ← Home
          </button>
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
            onDone={(points) => {
              setCompletedCount((c) => c + 1);
              setTodayScore((s) => s + points);
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