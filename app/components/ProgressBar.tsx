type Props = {
  current: number;
  total: number;
  score: number;
};

export default function ProgressBar({ current, total, score }: Props) {
  const pct = (current / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-baseline mb-2">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {current} / {total}
        </span>
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-accent)' }}
        >
          {score} PTS
        </span>
      </div>

      <div
        className="w-full border-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', height: '12px' }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: 'var(--color-accent)',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}