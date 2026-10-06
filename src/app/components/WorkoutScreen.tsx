import { useState, useEffect } from "react";
import { Plus, Trash2, Check, ChevronDown, ChevronUp, X, Clock, Dumbbell, Award, Flame, MessageSquare, Repeat } from "lucide-react";
import confetti from "canvas-confetti";
import { ExerciseEntry, SetEntry, WorkoutSession, MuscleGroup, UserSettings, CustomExercise, SetType } from "./types";
import { AddExerciseModal } from "./AddExerciseModal";
import { RestTimerModal } from "./RestTimerModal";
import { getExerciseMaxWeight, getPreviousExerciseSets, kgToLbs, lbsToKg } from "../utils/calculations";
import { sounds } from "../utils/audio";

interface Props {
  settings: UserSettings;
  history: WorkoutSession[];
  customExercises: CustomExercise[];
  templateSession?: WorkoutSession | null;
  onSave: (session: WorkoutSession) => void;
  onCreateCustomExercise: (ex: CustomExercise) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const muscleColors: Record<string, string> = {
  Chest: "#FF5C00", Back: "#C6FF00", Shoulders: "#00D4FF",
  Arms: "#A855F7", Legs: "#FFD60A", Core: "#FF3B30",
  Cardio: "#00FF88", "Full Body": "#FF69B4",
};

function formatTimer(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const setTypeLabels: Record<SetType, string> = {
  normal: "1",
  warmup: "W",
  drop: "D",
  failure: "F",
};

function ExerciseCard({
  exercise,
  history,
  unit,
  onUpdate,
  onDelete,
  onSetDoneToggle,
}: {
  exercise: ExerciseEntry;
  history: WorkoutSession[];
  unit: "kg" | "lbs";
  onUpdate: (e: ExerciseEntry) => void;
  onDelete: () => void;
  onSetDoneToggle: (exerciseName: string, set: SetEntry, isDone: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const prevSets = getPreviousExerciseSets(history, exercise.name);
  const maxWeightKg = getExerciseMaxWeight(history, exercise.name);

  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1];
    const newSet: SetEntry = {
      id: uid(),
      weight: last?.weight ?? 0,
      reps: last?.reps ?? 10,
      done: false,
      type: "normal",
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (id: string) => onUpdate({ ...exercise, sets: exercise.sets.filter((s) => s.id !== id) });

  const updateSet = (id: string, field: keyof SetEntry, val: number | boolean | SetType) => {
    const updatedSets = exercise.sets.map((s) => {
      if (s.id === id) {
        const updated = { ...s, [field]: val };
        if (field === "done" && typeof val === "boolean") {
          onSetDoneToggle(exercise.name, updated, val);
        }
        return updated;
      }
      return s;
    });
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const cycleSetType = (set: SetEntry) => {
    const types: SetType[] = ["normal", "warmup", "drop", "failure"];
    const currIdx = types.indexOf(set.type || "normal");
    const nextType = types[(currIdx + 1) % types.length];
    updateSet(set.id, "type", nextType);
  };

  const doneCount = exercise.sets.filter((s) => s.done).length;
  const color = muscleColors[exercise.muscleGroup] ?? "#888";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      {/* Exercise Card Header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <div className="min-w-0">
            <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.02em" }} className="truncate">
              {exercise.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-foreground)" }}>
                {doneCount}/{exercise.sets.length} sets · {exercise.muscleGroup}
              </span>
              {maxWeightKg > 0 && (
                <span className="flex items-center gap-1 rounded px-1.5 py-0.5" style={{ background: "rgba(255,214,10,0.12)", color: "#FFD60A", fontSize: 10, fontFamily: "var(--font-mono)" }}>
                  <Award size={10} /> Best: {unit === "lbs" ? `${kgToLbs(maxWeightKg)}lbs` : `${maxWeightKg}kg`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => setShowNotes(!showNotes)} className="rounded-full p-1.5" style={{ color: exercise.notes ? "var(--primary)" : "var(--muted-foreground)" }}>
            <MessageSquare size={16} />
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="rounded-full p-1.5" style={{ color: "var(--muted-foreground)" }}>
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button onClick={onDelete} className="rounded-full p-1.5" style={{ color: "#FF3B30" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Optional Exercise Notes Input */}
      {showNotes && (
        <div className="px-4 pb-3">
          <input
            value={exercise.notes || ""}
            onChange={(e) => onUpdate({ ...exercise, notes: e.target.value })}
            placeholder="Add notes for this exercise (e.g. seat height, grip width)..."
            className="w-full rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          />
        </div>
      )}

      {/* Previous Performance Hint */}
      {prevSets && prevSets.length > 0 && !collapsed && (
        <div className="px-4 pb-2">
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-foreground)" }}>
            Previous: {prevSets.map((s) => `${unit === "lbs" ? kgToLbs(s.weight) : s.weight}x${s.reps}`).join(", ")}
          </p>
        </div>
      )}

      {!collapsed && (
        <div className="px-4 pb-4">
          {/* Table Headers */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: "32px 1fr 1fr 40px" }}>
            {["TYPE", unit.toUpperCase(), "REPS", ""].map((h, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.08em",
                  textAlign: i === 3 ? "center" : "left",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Sets List */}
          {exercise.sets.map((set, idx) => {
            const displayWeight = unit === "lbs" ? kgToLbs(set.weight) : set.weight;
            const setTag = set.type || "normal";
            const setTagDisplay = setTag === "normal" ? `${idx + 1}` : setTypeLabels[setTag];

            return (
              <div key={set.id} className="grid gap-2 items-center mb-2" style={{ gridTemplateColumns: "32px 1fr 1fr 40px" }}>
                {/* Set Type Selector */}
                <button
                  onClick={() => cycleSetType(set)}
                  className="rounded-lg h-8 flex items-center justify-center transition-all font-mono font-bold text-xs"
                  style={{
                    background: setTag === "warmup" ? "rgba(255,214,10,0.2)" : setTag === "drop" ? "rgba(168,85,247,0.2)" : setTag === "failure" ? "rgba(255,59,48,0.2)" : "var(--secondary)",
                    color: setTag === "warmup" ? "#FFD60A" : setTag === "drop" ? "#A855F7" : setTag === "failure" ? "#FF3B30" : "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                  }}
                  title="Click to cycle set type: Normal -> Warmup -> Drop -> Failure"
                >
                  {setTagDisplay}
                </button>

                {/* Weight Input */}
                <input
                  type="number"
                  step="0.5"
                  value={displayWeight || ""}
                  onChange={(e) => {
                    const num = parseFloat(e.target.value) || 0;
                    const internalKg = unit === "lbs" ? lbsToKg(num) : num;
                    updateSet(set.id, "weight", internalKg);
                  }}
                  placeholder="0"
                  className="rounded-xl px-3 py-2 w-full outline-none"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    border: `1px solid ${set.done ? "var(--primary)" : "transparent"}`,
                  }}
                />

                {/* Reps Input */}
                <input
                  type="number"
                  value={set.reps || ""}
                  onChange={(e) => updateSet(set.id, "reps", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="rounded-xl px-3 py-2 w-full outline-none"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    border: `1px solid ${set.done ? "var(--primary)" : "transparent"}`,
                  }}
                />

                {/* Check / Done Toggle & Remove */}
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => updateSet(set.id, "done", !set.done)}
                    className="rounded-full w-8 h-8 flex items-center justify-center transition-all active:scale-95"
                    style={{ background: set.done ? "var(--primary)" : "var(--secondary)" }}
                  >
                    {set.done && <Check size={14} strokeWidth={3} style={{ color: "var(--primary-foreground)" }} />}
                  </button>
                  <button onClick={() => removeSet(set.id)} style={{ color: "rgba(255,59,48,0.5)" }}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={addSet}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl px-3 py-2 w-full transition-all"
            style={{ border: "1px dashed rgba(255,255,255,0.15)", color: "var(--muted-foreground)" }}
          >
            <Plus size={14} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>Add Set</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkoutScreen({ settings, history, customExercises, templateSession, onSave, onCreateCustomExercise }: Props) {
  const [workoutName, setWorkoutName] = useState(templateSession ? templateSession.name : "My Workout");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(null);
  const [prBanner, setPrBanner] = useState<string | null>(null);

  // Pre-fill exercises if repeating a template session
  useEffect(() => {
    if (templateSession && templateSession.exercises.length > 0) {
      const clonedExercises: ExerciseEntry[] = templateSession.exercises.map((ex) => ({
        id: uid(),
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        notes: ex.notes,
        sets: ex.sets.map((s) => ({
          id: uid(),
          weight: s.weight,
          reps: s.reps,
          done: false,
          type: s.type || "normal",
        })),
      }));
      setExercises(clonedExercises);
      setWorkoutName(templateSession.name);
      setStarted(true);
    }
  }, [templateSession]);

  // Workout duration timer
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started]);

  const addExercise = (name: string, muscleGroup: MuscleGroup) => {
    const prevSets = getPreviousExerciseSets(history, name);
    const initialWeight = prevSets?.[0]?.weight ?? 0;
    const initialReps = prevSets?.[0]?.reps ?? 10;

    const newEx: ExerciseEntry = {
      id: uid(),
      name,
      muscleGroup,
      sets: [{ id: uid(), weight: initialWeight, reps: initialReps, done: false, type: "normal" }],
    };
    setExercises((prev) => [...prev, newEx]);
    if (!started) setStarted(true);
  };

  const updateExercise = (updated: ExerciseEntry) => setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

  const deleteExercise = (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id));

  // Set completion handler with PR check & Rest Timer trigger
  const handleSetDoneToggle = (exerciseName: string, set: SetEntry, isDone: boolean) => {
    if (!started) setStarted(true);

    if (isDone) {
      // 1. Check Personal Record (PR)
      const prevMaxKg = getExerciseMaxWeight(history, exerciseName);
      if (set.weight > 0 && set.weight > prevMaxKg && prevMaxKg > 0) {
        // Trigger PR Celebration!
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        if (settings.soundEnabled) sounds.playFanfare();
        setPrBanner(`NEW PR! ${exerciseName}: ${settings.unit === "lbs" ? `${kgToLbs(set.weight)}lbs` : `${set.weight}kg`}`);
        setTimeout(() => setPrBanner(null), 4000);
      }

      // 2. Trigger Rest Timer if enabled
      if (settings.autoRestTimer) {
        setActiveRestTimer(settings.restTimerDuration);
      }
    }
  };

  const totalVolume = exercises.reduce((acc, ex) => acc + ex.sets.reduce((a, s) => a + (s.done ? s.weight * s.reps : 0), 0), 0);
  const totalDoneSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.done).length, 0);

  const handleFinish = () => {
    if (!exercises.length) return;

    // Confetti on workout finish
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    if (settings.soundEnabled) sounds.playFanfare();

    const session: WorkoutSession = {
      id: uid(),
      name: workoutName,
      date: new Date().toISOString().split("T")[0],
      durationMinutes: Math.max(1, Math.floor(seconds / 60)),
      exercises,
      totalVolume,
    };

    onSave(session);
    setExercises([]);
    setSeconds(0);
    setStarted(false);
    setWorkoutName("My Workout");
  };

  return (
    <>
      {showPicker && (
        <AddExerciseModal
          customExercises={customExercises}
          onAdd={addExercise}
          onCreateCustom={onCreateCustomExercise}
          onClose={() => setShowPicker(false)}
        />
      )}

      {activeRestTimer !== null && (
        <RestTimerModal
          initialSeconds={activeRestTimer}
          isOpen={true}
          onClose={() => setActiveRestTimer(null)}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* PR Toast Banner */}
      {prBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Award size={20} strokeWidth={2.5} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "0.04em" }}>{prBanner}</span>
        </div>
      )}

      <div className="flex flex-col pb-8">
        {/* Header */}
        <div className="pt-12 px-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="rounded-full p-2 flex-shrink-0" style={{ background: "rgba(198,255,0,0.1)" }}>
                <Dumbbell size={18} style={{ color: "var(--primary)" }} />
              </div>
              {showNameEdit ? (
                <input
                  autoFocus
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  onBlur={() => setShowNameEdit(false)}
                  onKeyDown={(e) => e.key === "Enter" && setShowNameEdit(false)}
                  className="rounded-xl px-2 py-1 outline-none w-full"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--foreground)",
                    background: "var(--secondary)",
                    border: "1px solid var(--primary)",
                  }}
                />
              ) : (
                <h1
                  onClick={() => setShowNameEdit(true)}
                  className="truncate"
                  style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--foreground)", cursor: "pointer" }}
                >
                  {workoutName}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {started && (
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: "rgba(255,92,0,0.12)", border: "1px solid rgba(255,92,0,0.25)" }}
                >
                  <Clock size={13} style={{ color: "var(--accent)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
                    {formatTimer(seconds)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Active Workout Live Stats */}
          {started && (
            <div className="flex gap-4 mt-3">
              {[
                { label: "Exercises", val: exercises.length },
                { label: "Sets Done", val: totalDoneSets },
                {
                  label: "Volume",
                  val: settings.unit === "lbs" ? `${(totalVolume * 2.20462 / 1000).toFixed(1)}k lbs` : `${(totalVolume / 1000).toFixed(1)}t`,
                },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{val}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise List */}
        <div className="flex flex-col gap-3 px-5 pt-4">
          {exercises.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="rounded-full p-5" style={{ background: "var(--secondary)" }}>
                <Dumbbell size={36} style={{ color: "var(--muted-foreground)" }} />
              </div>
              <div className="text-center">
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>No exercises added</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted-foreground)", marginTop: 4 }}>
                  Tap below to add exercises from the library
                </p>
              </div>
            </div>
          ) : (
            exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                history={history}
                unit={settings.unit}
                onUpdate={updateExercise}
                onDelete={() => deleteExercise(ex.id)}
                onSetDoneToggle={handleSetDoneToggle}
              />
            ))
          )}

          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95"
            style={{ border: "2px dashed rgba(198,255,0,0.35)", color: "var(--primary)" }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, letterSpacing: "0.06em" }}>
              ADD EXERCISE
            </span>
          </button>

          {exercises.length > 0 && (
            <button
              onClick={handleFinish}
              className="rounded-2xl py-4 transition-all active:scale-95 shadow-xl mt-2"
              style={{ background: "var(--primary)", boxShadow: "0 10px 30px rgba(198,255,0,0.25)" }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--primary-foreground)", letterSpacing: "0.06em" }}>
                FINISH WORKOUT
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
