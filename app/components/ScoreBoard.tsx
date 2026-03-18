import { Puzzle } from "@/app/types/puzzle";

type AttemptResult = {
  points: number;
  attempts: number;
  solved: boolean;
  wrongGuesses: string[];
};

type Props = {
  score: number;
  onShare: () => void;
  puzzles: Puzzle[];
  attempts: AttemptResult[];
};

export default function ScoreBoard({ score, onShare, puzzles, attempts }: Props) {
  const maxScore = puzzles.length * 3;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-6 pb-4 border-b-2" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-5xl font-bold" style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}>
          Results
        </h2>
        <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-accent)' }}>
          {score}/{maxScore}
        </span>
      </div>

      {/* Per-puzzle breakdown */}
      <div className="flex flex-col gap-2 mb-6">
        {puzzles.map((puzzle, i) => {
          const result = attempts[i];
          if (!result) return null;

          return (
            <div
              key={puzzle.id}
              className="border-2 p-4"
              style={{
                borderColor: result.solved ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: result.solved ? 'var(--color-bg2)' : 'var(--color-bg)',
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{i + 1}
                  </span>
                  <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}>
                    {puzzle.answer}
                  </span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'var(--font-syne)', color: result.solved ? 'var(--color-accent)' : 'var(--color-error)' }}
                >
                  {result.solved ? `+${result.points}` : '0'}
                </span>
              </div>

              {result.wrongGuesses.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {result.wrongGuesses.map((g, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 border"
                      style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-bg)' }}
                    >
                      ✗ {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <span
                    key={j}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        j < result.attempts
                          ? result.solved && j === result.attempts - 1 ? 'var(--color-accent)' : 'var(--color-error)'
                          : 'var(--color-border)',
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onShare}
        className="w-full py-4 text-sm font-bold uppercase tracking-widest border-2 transition-all"
        style={{ borderColor: 'var(--color-bright)', backgroundColor: 'var(--color-bright)', color: 'var(--color-bg)', fontFamily: 'var(--font-mono)' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-bright)')}
      >
        Share Results →
      </button>
    </div>
  );
}