export type MuscleGroup =
  | "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core" | "Cardio" | "Full Body";

export type SetType = "normal" | "warmup" | "drop" | "failure";

export interface SetEntry {
  id: string;
  weight: number;
  reps: number;
  done: boolean;
  type?: SetType;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: SetEntry[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // ISO date string YYYY-MM-DD
  durationMinutes: number;
  exercises: ExerciseEntry[];
  totalVolume: number; // kg * reps
  notes?: string;
}

export interface UserSettings {
  unit: "kg" | "lbs";
  autoRestTimer: boolean;
  restTimerDuration: number; // in seconds
  soundEnabled: boolean;
  themeColor: string;
}

export interface CustomExercise {
  name: string;
  muscleGroup: MuscleGroup;
}

export type Screen = "home" | "workout" | "history" | "stats" | "settings";

