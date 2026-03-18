export function getPoints(attemptNumber: number): number {
  const points: Record<number, number> = { 1: 3, 2: 2, 3: 1 };
  return points[attemptNumber] ?? 0;
}

export function normaliseGuess(guess: string): string {
  return guess
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export function checkGuess(guess: string, puzzle: { acceptedAnswers: string[] }): boolean {
  const normalised = normaliseGuess(guess);
  return puzzle.acceptedAnswers.some(
    (answer) => normaliseGuess(answer) === normalised
  );
}