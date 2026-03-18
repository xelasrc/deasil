import { Puzzle } from "@/app/types/puzzle";

type AttemptResult = {
  points: number;
  attempts: number;
  solved: boolean;
  wrongGuesses: string[];
};

type Props = {
  score: number;
  streak: number;
  totalScore: number;
  onShare: () => void;
  puzzles: Puzzle[];
  attempts: AttemptResult[];
};

export default function ScoreBoard({ score, streak, totalScore, onShare, puzzles, attempts }: Props) {
  const maxScore = puzzles.length * 3;

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-0 mb-6 border-2" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { label: "Today", value: `${score}/${maxScore}` },
          { label: "Streak", value: `${streak} 🔥` },
          { label: "All Time", value: totalScore },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-5 text-center"
            style={{
              borderRight: i < 2 ? '2px solid var(--color-border)' : 'none',
              backgroundColor: i === 0 ? 'var(--color-accent)' : 'var(--color-bg2)',
            }}
          >
            <p
              className="text-4xl font-bold mb-1"
              style={{
                fontFamily: 'var(--font-syne)',
                color: i === 0 ? 'var(--color-bg)' : 'var(--color-bright)',
              }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs uppercase tracking-widest"
              style={{
                fontFamily: 'var(--font-mono)',
                color: i === 0 ? 'var(--color-bg)' : 'var(--color-muted)',
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
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
              {/* Top row */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    #{i + 1}
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}
                  >
                    {puzzle.answer}
                  </span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    color: result.solved ? 'var(--color-accent)' : '#C1121F',
                  }}
                >
                  {result.solved ? `+${result.points}` : '0'}
                </span>
              </div>

              {/* Wrong guesses */}
              {result.wrongGuesses.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {result.wrongGuesses.map((g, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 border"
                      style={{
                        borderColor: '#C1121F',
                        color: '#C1121F',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--color-bg)',
                      }}
                    >
                      ✗ {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Attempt dots */}
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <span
                    key={j}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        j < result.attempts
                          ? result.solved && j === result.attempts - 1
                            ? 'var(--color-accent)'
                            : '#C1121F'
                          : 'var(--color-border)',
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Share button */}
      <button
        onClick={onShare}
        className="w-full py-4 text-sm font-bold uppercase tracking-widest border-2 transition-all"
        style={{
          borderColor: 'var(--color-bright)',
          backgroundColor: 'var(--color-bright)',
          color: 'var(--color-bg)',
          fontFamily: 'var(--font-mono)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-bright)')}
      >
        Share Results →
      </button>
    </div>
  );
}