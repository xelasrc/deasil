type Props = {
  clues: string[];
};

export default function ClueList({ clues }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {clues.map((clue) => (
        <span
          key={clue}
          className="text-xs px-3 py-1 border-2 font-medium uppercase tracking-wider"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {clue}
        </span>
      ))}
    </div>
  );
}