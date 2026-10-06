import { WorkoutSession, SetEntry } from "../components/types";

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function formatWeight(weightKg: number, unit: "kg" | "lbs"): string {
  if (unit === "lbs") {
    return `${kgToLbs(weightKg)} lbs`;
  }
  return `${weightKg} kg`;
}

export function displayWeightNum(weightKg: number, unit: "kg" | "lbs"): number {
  return unit === "lbs" ? kgToLbs(weightKg) : weightKg;
}

export function toInternalKg(displayWeight: number, unit: "kg" | "lbs"): number {
  return unit === "lbs" ? lbsToKg(displayWeight) : displayWeight;
}

/**
 * Calculates estimated 1-Rep Max using the Epley Formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calcOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/**
 * Finds the max weight lifted for a specific exercise in history
 */
export function getExerciseMaxWeight(history: WorkoutSession[], exerciseName: string): number {
  let max = 0;
  history.forEach(session => {
    session.exercises.forEach(ex => {
      if (ex.name.toLowerCase() === exerciseName.toLowerCase()) {
        ex.sets.forEach(set => {
          if (set.done && set.weight > max) {
            max = set.weight;
          }
        });
      }
    });
  });
  return max;
}

/**
 * Finds previous sets for an exercise from recent history
 */
export function getPreviousExerciseSets(history: WorkoutSession[], exerciseName: string): SetEntry[] | null {
  for (const session of history) {
    for (const ex of session.exercises) {
      if (ex.name.toLowerCase() === exerciseName.toLowerCase() && ex.sets.length > 0) {
        return ex.sets;
      }
    }
  }
  return null;
}

/**
 * Calculates current streak in days based on workout dates
 */
export function calcStreak(sessions: WorkoutSession[]): number {
  if (!sessions || sessions.length === 0) return 0;
  
  // Sort dates unique descending
  const dates = Array.from(new Set(sessions.map(s => s.date))).sort().reverse();
  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  // Check if active today or yesterday
  const latestDate = dates[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    // If last workout was before yesterday, streak is broken
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(latestDate);

  for (const dateStr of dates) {
    const d = new Date(dateStr);
    const diffDays = Math.round((currentDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays <= 1) {
      streak++;
      currentDate = d;
    } else {
      break;
    }
  }

  return streak;
}
