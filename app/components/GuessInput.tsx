"use client";
import { useState } from "react";

type Props = {
  onGuess: (guess: string) => void;
  onSkip: () => void;
  disabled: boolean;
  attemptsLeft: number;
};

export default function GuessInput({ onGuess, onSkip, disabled, attemptsLeft }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim()) return;
    onGuess(value.trim());
    setValue("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-0">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={disabled}
          placeholder="YOUR GUESS..."
          className="flex-1 px-4 py-3 text-sm uppercase tracking-widest border-2 border-r-0 focus:outline-none disabled:opacity-50"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-bright)',
            fontFamily: 'var(--font-mono)',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="px-6 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-all disabled:opacity-40"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-bg)',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-bright)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
        >
          GUESS →
        </button>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left
        </span>
        <button
          onClick={onSkip}
          disabled={disabled}
          className="text-xs uppercase tracking-widest underline disabled:opacity-40 transition-opacity"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Skip →
        </button>
      </div>
    </div>
  );
}