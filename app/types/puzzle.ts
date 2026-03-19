export type Puzzle = {
  id: number;
  answer: string;
  acceptedAnswers: string[];
  clues: string[];
  summary: string;
  sourceUrl: string;
  imageUrl: string;
  difficulty: "easy" | "medium" | "hard";
  region: "global" | "english";
};

export type DailyPuzzle = {
  date: string;
  puzzles: Puzzle[];
};

export type PuzzleAttempt = {
  id: number;
  solved: boolean;
  attempts: number;
  points: number;
  skipped: boolean;
  wrongGuesses: string[];
};

export type DayHistory = {
  totalScore: number;
  puzzles: PuzzleAttempt[];
};

export type GameStorage = {
  streak: number;
  lastPlayedDate: string;
  totalScore: number;
  history: Record<string, DayHistory>;
};