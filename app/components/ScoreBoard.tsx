type Props = {
  score: number;
  streak: number;
  totalScore: number;
  onShare: () => void;
};

export default function ScoreBoard({ score, streak, totalScore, onShare }: Props) {
  return (
    <div
      className="border-2 p-8"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--cream)' }}
    >
      <h2
        className="text-6xl font-bold mb-8 border-b-2 pb-4"
        style={{ fontFamily: 'Bebas Neue, sans-serif', borderColor: 'var(--border)' }}
      >
        Today's Results
      </h2>

      <div className="grid grid-cols-3 gap-0 mb-8">
        {[
          { label: "Today", value: score, color: 'var(--orange)' },
          { label: "Streak", value: `${streak}🔥`, color: 'var(--dark)' },
          { label: "All Time", value: totalScore, color: 'var(--dark)' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-6 border-2 text-center"
            style={{
              borderColor: 'var(--border)',
              borderLeft: i > 0 ? 'none' : undefined,
              backgroundColor: i === 0 ? 'var(--orange)' : 'var(--cream)',
            }}
          >
            <p
              className="text-5xl font-bold mb-1"
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                color: i === 0 ? 'var(--cream)' : 'var(--dark)',
              }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: i === 0 ? 'var(--cream)' : 'var(--muted)' }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={onShare}
        className="w-full py-4 text-sm font-bold uppercase tracking-widest border-2 transition-all"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--dark)',
          color: 'var(--cream)',
          fontFamily: 'IBM Plex Mono, monospace',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--orange)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--dark)')}
      >
        Share Results →
      </button>
    </div>
  );
}