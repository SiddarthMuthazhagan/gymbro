import { WorkoutSession, UserSettings, CustomExercise } from "../components/types";
import { SAMPLE_HISTORY } from "../components/data";

const HISTORY_KEY = "gymbro_workout_history_v1";
const SETTINGS_KEY = "gymbro_user_settings_v1";
const CUSTOM_EXERCISES_KEY = "gymbro_custom_exercises_v1";

export const DEFAULT_SETTINGS: UserSettings = {
  unit: "kg",
  autoRestTimer: true,
  restTimerDuration: 90,
  soundEnabled: true,
  themeColor: "#C6FF00",
};

export function loadHistory(): WorkoutSession[] {
  if (typeof window === "undefined") return SAMPLE_HISTORY;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return SAMPLE_HISTORY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_HISTORY;
  } catch {
    return SAMPLE_HISTORY;
  }
}

export function saveHistory(history: WorkoutSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Failed to save history", err);
  }
}

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings", err);
  }
}

export function loadCustomExercises(): CustomExercise[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomExercises(list: CustomExercise[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save custom exercises", err);
  }
}

export function exportAppData(): string {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    history: loadHistory(),
    settings: loadSettings(),
    customExercises: loadCustomExercises(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAppData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.history && Array.isArray(data.history)) {
      saveHistory(data.history);
    }
    if (data.settings) {
      saveSettings(data.settings);
    }
    if (data.customExercises && Array.isArray(data.customExercises)) {
      saveCustomExercises(data.customExercises);
    }
    return true;
  } catch (e) {
    console.error("Import error", e);
    return false;
  }
}

export function resetAppData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(CUSTOM_EXERCISES_KEY);
}
