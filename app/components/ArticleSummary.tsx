import Image from "next/image";

type Props = {
  summary: string;
  sourceUrl: string;
  imageUrl: string;
  answer: string;
  points: number;
  solved: boolean;
};

export default function ArticleSummary({ summary, sourceUrl, imageUrl, answer, points, solved }: Props) {
  return (
    <div
      className="border-2 mt-4 overflow-hidden"
      style={{
        borderColor: solved ? 'var(--color-accent)' : 'var(--color-error)',
      }}
    >
      {/* Image with overlay */}
      {imageUrl && (
        <div className="w-full h-48 md:h-56 relative">
          <Image
            src={imageUrl}
            alt={answer}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }}
          />
          {/* Answer + points on top of image */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 flex justify-between items-end">
            <div>
              <span
                className="text-xs uppercase tracking-widest block mb-1"
                style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}
              >
                {solved ? '✓ Correct' : '✗ Incorrect'}
              </span>
              <span
                className="text-xl md:text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                {answer}
              </span>
            </div>
            <span
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: 'var(--font-syne)',
                color: solved ? 'var(--color-accent)' : 'var(--color-error)',
              }}
            >
              {solved ? `+${points}` : '0'}
            </span>
          </div>
        </div>
      )}

      {/* No image fallback header */}
      {!imageUrl && (
        <div
          className="p-3 md:p-4 flex justify-between items-start border-b-2"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: solved ? 'var(--color-bg2)' : '#FFF0F0',
          }}
        >
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
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: 'var(--font-syne)',
              color: solved ? 'var(--color-accent)' : 'var(--color-error)',
            }}
          >
            {solved ? `+${points}` : '0'}
          </span>
        </div>
      )}

      {/* Summary + link */}
      <div
        className="p-3 md:p-4"
        style={{ backgroundColor: solved ? 'var(--color-bg2)' : '#FFF0F0' }}
      >
        <p
          className="text-sm leading-relaxed mb-3"
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
          {"Read more →"}
        </a>
      </div>
    </div>
  );
}