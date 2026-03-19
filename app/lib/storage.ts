import { GameStorage, DayHistory } from "../types/puzzle";
import { getToday } from "./date";

const STORAGE_KEY = "deasil_game";

const PROGRESS_KEY = (date: string) => `deasil_progress_${date}`;

export type GameProgress = {
  currentIndex: number;
  completedCount: number;
  todayScore: number;
  attempts: { points: number; attempts: number; solved: boolean; wrongGuesses: string[] }[];
  currentQuestionWrongGuesses?: string[];
};

export function saveProgress(date: string, progress: GameProgress): void {
  localStorage.setItem(PROGRESS_KEY(date), JSON.stringify(progress));
}

export function getProgress(date: string): GameProgress | null {
  const raw = localStorage.getItem(PROGRESS_KEY(date));
  return raw ? JSON.parse(raw) : null;
}

export function clearProgress(date: string): void {
  localStorage.removeItem(PROGRESS_KEY(date));
}

export function getStorage(): GameStorage {
  if (typeof window === "undefined") return defaultStorage();
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : defaultStorage();
}

export function saveStorage(data: GameStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayHistory(date: string): DayHistory | null {
  const storage = getStorage();
  return storage.history[date] ?? null;
}

export function saveDayHistory(date: string, history: DayHistory): void {
  const storage = getStorage();
  const today = getToday();

  const existing = storage.history[date];
  if (existing) {
    storage.totalScore -= existing.totalScore;
  }

  storage.history[date] = history;
  storage.totalScore += history.totalScore;

  if (date === today && !existing) {
    if (!storage.lastPlayedDate) {
      storage.streak = 1;
    } else {
      const last = new Date(storage.lastPlayedDate + "T00:00:00");
      const current = new Date(today + "T00:00:00");
      const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      storage.streak = diffDays === 1 ? storage.streak + 1 : 1;
    }
    storage.lastPlayedDate = today;
  }

  saveStorage(storage);
}

function defaultStorage(): GameStorage {
  return {
    streak: 0,
    lastPlayedDate: "",
    totalScore: 0,
    history: {},
  };
}