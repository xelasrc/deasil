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

  // If this date already has a score saved, subtract it first
  const existing = storage.history[date];
  if (existing) {
    storage.totalScore -= existing.totalScore;
  }

  storage.history[date] = history;
  storage.totalScore += history.totalScore;

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];

  if (storage.lastPlayedDate !== date) {
    storage.streak = storage.lastPlayedDate === yStr ? storage.streak + 1 : 1;
  }

  storage.lastPlayedDate = date;
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