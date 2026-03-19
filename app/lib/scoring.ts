import { distance } from "fastest-levenshtein";

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

function extractNumbers(str: string): string[] {
  return str.match(/\d+/g) ?? [];
}

function numbersMatch(guess: string, answer: string): boolean {
  const answerNums = extractNumbers(answer);
  if (answerNums.length === 0) return true;
  const guessNums = extractNumbers(guess);
  return answerNums.every(n => guessNums.includes(n));
}

export function checkGuess(guess: string, puzzle: { acceptedAnswers: string[] }): boolean {
  const normalised = normaliseGuess(guess);

  if (normalised.length === 0) return false;

  return puzzle.acceptedAnswers.some((answer) => {
    const normalisedAnswer = normaliseGuess(answer);

    // Short answers (<=3 chars like US, NZ) — exact match only
    if (normalisedAnswer.length <= 3) {
      return normalised === normalisedAnswer;
    }

    // If answer has numbers, guess must have the same numbers
    if (!numbersMatch(normalised, normalisedAnswer)) return false;

    // Exact match
    if (normalised === normalisedAnswer) return true;

    // Fuzzy match — always allow at least 1 typo, 1 more per 8 chars
    const maxDistance = Math.max(1, Math.floor(normalisedAnswer.length / 8));
    if (distance(normalised, normalisedAnswer) <= maxDistance) return true;

    // Word-based partial match — ALL guess words must appear in answer,
    // and guess must be at least 2 words to avoid first-name-only guesses
    if (normalised.length >= 4) {
      const guessWords = normalised.split(" ");
      const answerWords = normalisedAnswer.split(" ");

      if (
        guessWords.length >= 2 &&
        guessWords.every(w => answerWords.includes(w))
      ) return true;

      // Answer fully contained in guess (e.g. extra words typed)
      // but answer must be >70% of what was typed
      if (
        normalised.includes(normalisedAnswer) &&
        normalisedAnswer.length / normalised.length > 0.7
      ) return true;
    }

    return false;
  });
}