type Props = {
  summary: string;
  sourceUrl: string;
  answer: string;
  points: number;
  solved: boolean;
};

export default function ArticleSummary({ summary, sourceUrl, answer, points, solved }: Props) {
  return (
    <div
      className="p-3 md:p-4 border-2 mt-4"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: solved ? '#FFF3E0' : '#FFF0F0',
        borderLeft: `6px solid ${solved ? 'var(--color-success)' : 'var(--color-error)'}`,
      }}
    >
      <div className="flex justify-between items-start mb-2 md:mb-3">
        <div>
          <span
            className="text-xs uppercase tracking-widest block mb-1"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {solved ? '✓ Correct' : '✗ Incorrect'}
          </span>
          <span
            className="text-xl md:text-2xl font-bold"
            style={{ fontFamily: 'var(--font-syne)', color: 'var(--color-bright)' }}
          >
            {answer}
          </span>
        </div>
        <span
          className="text-2xl md:text-3xl font-bold shrink-0 ml-2"
          style={{ fontFamily: 'var(--font-syne)', color: solved ? 'var(--color-accent)' : 'var(--color-error)' }}
        >
          {solved ? `+${points}` : '0'}
        </span>
      </div>
      <p
        className="text-sm leading-relaxed mb-2 md:mb-3"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
      >
        {summary}
      </p>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs uppercase tracking-widest underline"
        style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
      >
        Read more →
      </a>
    </div>
  );
}