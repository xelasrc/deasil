import { GameStorage, DayHistory } from "../types/puzzle";

const STORAGE_KEY = "deasil_game";

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
  const today = new Date().toISOString().split("T")[0];

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