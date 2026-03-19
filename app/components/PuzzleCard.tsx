"use client";
import { useState } from "react";
import { Puzzle } from "@/app/types/puzzle";
import { checkGuess, getPoints } from "@/app/lib/scoring";
import ClueList from "./ClueList";
import GuessInput from "./GuessInput";
import ArticleSummary from "./ArticleSummary";

type Props = {
  puzzle: Puzzle;
  puzzleNumber: number;
  totalPuzzles: number;
  onDone: (points: number, attempts: number, solved: boolean, wrongGuesses: string[]) => void;
  onComplete: (points: number, attempts: number, solved: boolean, wrongGuesses: string[]) => void;
};

export default function PuzzleCard({ puzzle, puzzleNumber, totalPuzzles, onDone, onComplete }: Props) {
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [solved, setSolved] = useState(false);
  const [points, setPoints] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const MAX_ATTEMPTS = 3;

  function handleGuess(guess: string) {
    const correct = checkGuess(guess, puzzle);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (correct) {
      const earnedPoints = getPoints(newAttempts);
      setPoints(earnedPoints);
      setSolved(true);
      setDone(true);
      onDone(earnedPoints, newAttempts, true, wrongGuesses);
    } else {
      const newWrongGuesses = [...wrongGuesses, guess];
      setWrongGuesses(newWrongGuesses);
      if (newAttempts >= MAX_ATTEMPTS) {
        setDone(true);
        onDone(0, newAttempts, false, newWrongGuesses);
      }
    }
  }

  function handleSkip() {
    setAttempts(MAX_ATTEMPTS);
    setDone(true);
    onDone(0, MAX_ATTEMPTS, false, wrongGuesses);
  }

  return (
    <div
      className="border-2 p-4 md:p-6"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg2)' }}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-4">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          #{puzzleNumber}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  i < attempts
                    ? solved && i === attempts - 1 ? 'var(--color-success)' : 'var(--color-error)'
                    : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      </div>

      <ClueList clues={puzzle.clues} />

      {wrongGuesses.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1 md:gap-2">
          {wrongGuesses.map((g, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 border"
              style={{
                borderColor: 'var(--color-error)',
                color: 'var(--color-error)',
                backgroundColor: 'var(--color-bg)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ✗ {g}
            </span>
          ))}
        </div>
      )}

      {!done ? (
        <GuessInput
          onGuess={handleGuess}
          onSkip={handleSkip}
          disabled={done}
          attemptsLeft={MAX_ATTEMPTS - attempts}
        />
      ) : (
        <div>
          <ArticleSummary
            summary={puzzle.summary}
            sourceUrl={puzzle.sourceUrl}
            imageUrl={puzzle.imageUrl}
            answer={puzzle.answer}
            points={points}
            solved={solved}
          />
          <button
            onClick={() => onComplete(points, attempts, solved, wrongGuesses)}
            className="w-full mt-4 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-all"
            style={{
              borderColor: 'var(--color-bright)',
              backgroundColor: 'var(--color-bright)',
              color: 'var(--color-bg)',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-bright)')}
          >
            {puzzleNumber === totalPuzzles ? 'See Results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}