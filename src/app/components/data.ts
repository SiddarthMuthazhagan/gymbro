import { WorkoutSession } from "./types";

export const EXERCISE_LIBRARY: { name: string; muscleGroup: string }[] = [
  { name: "Bench Press", muscleGroup: "Chest" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { name: "Cable Fly", muscleGroup: "Chest" },
  { name: "Push-Ups", muscleGroup: "Chest" },
  { name: "Deadlift", muscleGroup: "Back" },
  { name: "Pull-Ups", muscleGroup: "Back" },
  { name: "Barbell Row", muscleGroup: "Back" },
  { name: "Lat Pulldown", muscleGroup: "Back" },
  { name: "Seated Cable Row", muscleGroup: "Back" },
  { name: "Overhead Press", muscleGroup: "Shoulders" },
  { name: "Lateral Raises", muscleGroup: "Shoulders" },
  { name: "Front Raises", muscleGroup: "Shoulders" },
  { name: "Face Pulls", muscleGroup: "Shoulders" },
  { name: "Barbell Curl", muscleGroup: "Arms" },
  { name: "Hammer Curl", muscleGroup: "Arms" },
  { name: "Skull Crushers", muscleGroup: "Arms" },
  { name: "Tricep Pushdown", muscleGroup: "Arms" },
  { name: "Squat", muscleGroup: "Legs" },
  { name: "Leg Press", muscleGroup: "Legs" },
  { name: "Romanian Deadlift", muscleGroup: "Legs" },
  { name: "Leg Curl", muscleGroup: "Legs" },
  { name: "Leg Extension", muscleGroup: "Legs" },
  { name: "Calf Raises", muscleGroup: "Legs" },
  { name: "Plank", muscleGroup: "Core" },
  { name: "Cable Crunch", muscleGroup: "Core" },
  { name: "Russian Twists", muscleGroup: "Core" },
  { name: "Running", muscleGroup: "Cardio" },
  { name: "Cycling", muscleGroup: "Cardio" },
];

const id = (n: number) => `hist-${n}`;

export const SAMPLE_HISTORY: WorkoutSession[] = [
  {
    id: id(1),
    name: "Push Day A",
    date: "2026-08-03",
    durationMinutes: 62,
    totalVolume: 8540,
    exercises: [
      {
        id: "e1", name: "Bench Press", muscleGroup: "Chest",
        sets: [
          { id: "s1", weight: 80, reps: 8, done: true },
          { id: "s2", weight: 80, reps: 8, done: true },
          { id: "s3", weight: 85, reps: 6, done: true },
          { id: "s4", weight: 85, reps: 6, done: true },
        ],
      },
      {
        id: "e2", name: "Incline Dumbbell Press", muscleGroup: "Chest",
        sets: [
          { id: "s5", weight: 30, reps: 10, done: true },
          { id: "s6", weight: 30, reps: 10, done: true },
          { id: "s7", weight: 32.5, reps: 9, done: true },
        ],
      },
      {
        id: "e3", name: "Overhead Press", muscleGroup: "Shoulders",
        sets: [
          { id: "s8", weight: 60, reps: 8, done: true },
          { id: "s9", weight: 60, reps: 7, done: true },
          { id: "s10", weight: 60, reps: 7, done: true },
        ],
      },
    ],
  },
  {
    id: id(2),
    name: "Pull Day A",
    date: "2026-08-01",
    durationMinutes: 55,
    totalVolume: 9120,
    exercises: [
      {
        id: "e4", name: "Deadlift", muscleGroup: "Back",
        sets: [
          { id: "s11", weight: 120, reps: 5, done: true },
          { id: "s12", weight: 130, reps: 4, done: true },
          { id: "s13", weight: 130, reps: 4, done: true },
        ],
      },
      {
        id: "e5", name: "Pull-Ups", muscleGroup: "Back",
        sets: [
          { id: "s14", weight: 0, reps: 10, done: true },
          { id: "s15", weight: 0, reps: 9, done: true },
          { id: "s16", weight: 0, reps: 8, done: true },
        ],
      },
      {
        id: "e6", name: "Barbell Curl", muscleGroup: "Arms",
        sets: [
          { id: "s17", weight: 40, reps: 10, done: true },
          { id: "s18", weight: 40, reps: 10, done: true },
          { id: "s19", weight: 42.5, reps: 8, done: true },
        ],
      },
    ],
  },
  {
    id: id(3),
    name: "Leg Day",
    date: "2026-07-30",
    durationMinutes: 70,
    totalVolume: 14200,
    exercises: [
      {
        id: "e7", name: "Squat", muscleGroup: "Legs",
        sets: [
          { id: "s20", weight: 100, reps: 6, done: true },
          { id: "s21", weight: 100, reps: 6, done: true },
          { id: "s22", weight: 105, reps: 5, done: true },
          { id: "s23", weight: 105, reps: 5, done: true },
        ],
      },
      {
        id: "e8", name: "Leg Press", muscleGroup: "Legs",
        sets: [
          { id: "s24", weight: 160, reps: 10, done: true },
          { id: "s25", weight: 160, reps: 10, done: true },
          { id: "s26", weight: 180, reps: 8, done: true },
        ],
      },
      {
        id: "e9", name: "Romanian Deadlift", muscleGroup: "Legs",
        sets: [
          { id: "s27", weight: 80, reps: 10, done: true },
          { id: "s28", weight: 80, reps: 10, done: true },
          { id: "s29", weight: 80, reps: 9, done: true },
        ],
      },
    ],
  },
  {
    id: id(4),
    name: "Push Day B",
    date: "2026-07-28",
    durationMinutes: 58,
    totalVolume: 7850,
    exercises: [
      {
        id: "e10", name: "Bench Press", muscleGroup: "Chest",
        sets: [
          { id: "s30", weight: 82.5, reps: 7, done: true },
          { id: "s31", weight: 82.5, reps: 7, done: true },
          { id: "s32", weight: 82.5, reps: 6, done: true },
        ],
      },
    ],
  },
  {
    id: id(5),
    name: "Pull Day B",
    date: "2026-07-26",
    durationMinutes: 48,
    totalVolume: 8300,
    exercises: [],
  },
  {
    id: id(6),
    name: "Leg Day",
    date: "2026-07-23",
    durationMinutes: 65,
    totalVolume: 13400,
    exercises: [],
  },
  {
    id: id(7),
    name: "Push Day A",
    date: "2026-07-21",
    durationMinutes: 60,
    totalVolume: 8100,
    exercises: [],
  },
];
