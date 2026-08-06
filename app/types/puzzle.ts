export type Puzzle = {
  id: number;
  answer: string;
  acceptedAnswers: string[];
  clues: string[];
  summary: string;
  sourceUrl: string;
  imageUrl: string;
  difficulty: "easy" | "medium" | "hard";
  region: string;
  // Short descriptor of the underlying news story, used at generation time
  // to stop different entities from the same story being reused as answers
  // on nearby days. Optional since puzzles generated before this field
  // existed won't have it.
  event?: string;
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