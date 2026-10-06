import { useState, useRef, useEffect } from "react";
import { X, Search, Plus, Dumbbell, Check } from "lucide-react";
import { MuscleGroup, CustomExercise } from "./types";
import { EXERCISE_LIBRARY } from "./data";

interface Props {
  customExercises: CustomExercise[];
  onAdd: (name: string, group: MuscleGroup) => void;
  onCreateCustom: (exercise: CustomExercise) => void;
  onClose: () => void;
}

const muscleGroups: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio", "Full Body"];

const muscleColors: Record<string, string> = {
  Chest: "#FF5C00", Back: "#C6FF00", Shoulders: "#00D4FF",
  Arms: "#A855F7", Legs: "#FFD60A", Core: "#FF3B30",
  Cardio: "#00FF88", "Full Body": "#FF69B4",
};

export function AddExerciseModal({ customExercises, onAdd, onCreateCustom, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MuscleGroup | "All">("All");
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>("Chest");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Merge built-in library with user's custom exercises
  const allExercises = [
    ...customExercises.map((c) => ({ name: c.name, muscleGroup: c.muscleGroup, isCustom: true })),
    ...EXERCISE_LIBRARY.map((e) => ({ name: e.name, muscleGroup: e.muscleGroup, isCustom: false })),
  ];

  // Remove duplicates by name
  const uniqueExercises = Array.from(new Map(allExercises.map((item) => [item.name.toLowerCase(), item])).values());

  const filtered = uniqueExercises.filter(
    (e) => (filter === "All" || e.muscleGroup === filter) && e.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newEx: CustomExercise = { name: customName.trim(), muscleGroup: customMuscle };
    onCreateCustom(newEx);
    onAdd(newEx.name, newEx.muscleGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div
        className="w-full max-w-lg h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-200"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="rounded-full p-2" style={{ background: "rgba(198,255,0,0.12)" }}>
              <Dumbbell size={18} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--foreground)" }}>
              {isCreatingCustom ? "CREATE CUSTOM EXERCISE" : "EXERCISE LIBRARY"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/5" style={{ color: "var(--muted-foreground)" }}>
            <X size={20} />
          </button>
        </div>

        {isCreatingCustom ? (
          /* Custom Exercise Creation Form */
          <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)" }}>
                Exercise Name
              </label>
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Bulgarian Split Squat"
                required
                className="w-full rounded-2xl px-4 py-3.5 mt-1.5 outline-none"
                style={{
                  background: "var(--secondary)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                  border: "1px solid var(--border)",
                }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)" }}>
                Target Muscle Group
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {muscleGroups.map((g) => {
                  const isSel = customMuscle === g;
                  const color = muscleColors[g] ?? "#888";
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setCustomMuscle(g)}
                      className="rounded-2xl p-3 flex items-center justify-between transition-all"
                      style={{
                        background: isSel ? `${color}20` : "var(--secondary)",
                        border: isSel ? `2px solid ${color}` : "1px solid var(--border)",
                        color: isSel ? color : "var(--foreground)",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>{g}</span>
                      {isSel && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="flex-1 rounded-2xl py-3.5"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontFamily: "var(--font-body)", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl py-3.5 transition-all active:scale-95"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                }}
              >
                SAVE & ADD
              </button>
            </div>
          </form>
        ) : (
          /* Exercise Search & List */
          <>
            <div className="px-5 pt-4 pb-2">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search exercise by name..."
                  className="w-full rounded-2xl pl-10 pr-4 py-3 outline-none"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    border: "1px solid var(--border)",
                  }}
                />
              </div>
            </div>

            {/* Muscle Group Filter Chips */}
            <div className="flex gap-2 px-5 py-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
              {(["All", ...muscleGroups] as (MuscleGroup | "All")[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className="rounded-full px-3.5 py-1.5 flex-shrink-0 transition-all"
                  style={{
                    background: filter === g ? "var(--primary)" : "var(--secondary)",
                    color: filter === g ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: "none" }}>
              <div className="flex flex-col">
                {filtered.map((ex) => (
                  <button
                    key={ex.name}
                    onClick={() => {
                      onAdd(ex.name, ex.muscleGroup as MuscleGroup);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between py-3.5 text-left transition-all hover:bg-white/5 px-2 rounded-xl"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>
                        {ex.name}
                      </span>
                      {ex.isCustom && (
                        <span
                          className="rounded px-1.5 py-0.5"
                          style={{ background: "rgba(255,255,255,0.1)", color: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                        >
                          Custom
                        </span>
                      )}
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5"
                      style={{
                        background: `${muscleColors[ex.muscleGroup] ?? "#888"}22`,
                        color: muscleColors[ex.muscleGroup] ?? "#888",
                        fontFamily: "var(--font-body)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {ex.muscleGroup}
                    </span>
                  </button>
                ))}

                {filtered.length === 0 && (
                  <div className="py-12 text-center" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
                    <p style={{ fontSize: 15 }}>No matching exercises found</p>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustom(true)}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2"
                      style={{ background: "rgba(198,255,0,0.15)", color: "var(--primary)", fontWeight: 600 }}
                    >
                      <Plus size={16} /> Create "{query || "New Exercise"}"
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Create Button CTA */}
            <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => setIsCreatingCustom(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 transition-all active:scale-95"
                style={{ background: "var(--secondary)", color: "var(--primary)", border: "1px border var(--border)" }}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>
                  CREATE CUSTOM EXERCISE
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
