import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Clock, Zap, Repeat, Trash2, Search, Filter } from "lucide-react";
import { WorkoutSession, MuscleGroup, UserSettings } from "./types";
import { formatWeight, kgToLbs } from "../utils/calculations";

interface Props {
  history: WorkoutSession[];
  settings: UserSettings;
  onRepeatWorkout: (session: WorkoutSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const muscleGroups: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio", "Full Body"];

const muscleColors: Record<string, string> = {
  Chest: "#FF5C00", Back: "#C6FF00", Shoulders: "#00D4FF",
  Arms: "#A855F7", Legs: "#FFD60A", Core: "#FF3B30",
  Cardio: "#00FF88", "Full Body": "#FF69B4",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function SessionCard({
  session,
  settings,
  onRepeat,
  onDelete,
}: {
  session: WorkoutSession;
  settings: UserSettings;
  onRepeat: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const muscles = [...new Set(session.exercises.map((e) => e.muscleGroup))];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.02em" }}>
              {session.name}
            </p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)", fontSize: 12 }}>
                <Calendar size={12} />
                {formatDate(session.date)}
              </span>
              <span className="flex items-center gap-1" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)", fontSize: 12 }}>
                <Clock size={12} />
                {session.durationMinutes}min
              </span>
              <span className="flex items-center gap-1" style={{ color: "var(--primary)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>
                <Zap size={12} />
                {formatWeight(session.totalVolume, settings.unit)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onRepeat}
              className="rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 transition-all active:scale-95"
              style={{ background: "rgba(198,255,0,0.12)", color: "var(--primary)" }}
              title="Repeat this workout"
            >
              <Repeat size={13} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700 }}>Repeat</span>
            </button>
            <button onClick={() => setExpanded(!expanded)} className="rounded-full p-1.5" style={{ color: "var(--muted-foreground)" }}>
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {muscles.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {muscles.map((m) => (
              <span
                key={m}
                className="rounded-full px-2.5 py-0.5"
                style={{
                  background: `${muscleColors[m] ?? "#888"}20`,
                  color: muscleColors[m] ?? "#888",
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border)" }}>
          {session.exercises.length > 0 ? (
            <div className="pt-3 flex flex-col gap-3">
              {session.exercises.map((ex) => {
                const color = muscleColors[ex.muscleGroup] ?? "#888";
                const maxWeightKg = Math.max(...ex.sets.map((s) => s.weight));
                const displayMax = settings.unit === "lbs" ? kgToLbs(maxWeightKg) : maxWeightKg;
                const totalReps = ex.sets.reduce((a, s) => a + s.reps, 0);

                return (
                  <div key={ex.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
                          {ex.name}
                        </span>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>
                        {ex.sets.length} sets
                      </span>
                    </div>

                    <div className="rounded-xl overflow-hidden" style={{ background: "var(--secondary)" }}>
                      <div className="grid px-3 py-1.5" style={{ gridTemplateColumns: "28px 1fr 1fr 1fr" }}>
                        {["#", `Weight (${settings.unit})`, "Reps", "Vol"].map((h) => (
                          <span key={h} style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>
                            {h}
                          </span>
                        ))}
                      </div>
                      {ex.sets.map((set, i) => {
                        const setWeightDisplay = settings.unit === "lbs" ? kgToLbs(set.weight) : set.weight;
                        const setVolDisplay = settings.unit === "lbs" ? Math.round(kgToLbs(set.weight) * set.reps) : set.weight * set.reps;
                        return (
                          <div key={set.id} className="grid px-3 py-2" style={{ gridTemplateColumns: "28px 1fr 1fr 1fr", borderTop: "1px solid var(--border)" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted-foreground)" }}>{i + 1}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground)" }}>{setWeightDisplay}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground)" }}>{set.reps}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--primary)" }}>{setVolDisplay}</span>
                          </div>
                        );
                      })}
                      <div className="grid px-3 py-2" style={{ gridTemplateColumns: "28px 1fr 1fr 1fr", borderTop: "1px solid var(--border)", background: "rgba(198,255,0,0.04)" }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>MAX</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color }}>{displayMax}{settings.unit}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color }}>{totalReps}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color }}>
                          {formatWeight(ex.sets.reduce((a, s) => a + s.weight * s.reps, 0), settings.unit)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="pt-3" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted-foreground)" }}>
              No exercise details logged.
            </p>
          )}

          <div className="mt-4 pt-3 flex justify-end" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              style={{ background: "rgba(255,59,48,0.12)", color: "#FF3B30", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600 }}
            >
              <Trash2 size={13} /> Delete Workout Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryScreen({ history, settings, onRepeatWorkout, onDeleteSession }: Props) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "All">("All");

  const filtered = history.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.exercises.some((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    const matchesMuscle =
      muscleFilter === "All" || s.exercises.some((e) => e.muscleGroup === muscleFilter);
    return matchesSearch && matchesMuscle;
  });

  const grouped: Record<string, WorkoutSession[]> = {};
  filtered.forEach((s) => {
    const d = new Date(s.date);
    const month = isNaN(d.getTime()) ? "Workouts" : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(s);
  });

  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="pt-12 px-5 pb-4">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--foreground)", letterSpacing: "0.02em" }}>
          WORKOUT HISTORY
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
          {history.length} workouts logged
        </p>
      </div>

      {/* Search Input */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workouts or exercises..."
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

      {/* Muscle Filter Chips */}
      <div className="flex gap-2 px-5 mb-5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
        {(["All", ...muscleGroups] as (MuscleGroup | "All")[]).map((g) => (
          <button
            key={g}
            onClick={() => setMuscleFilter(g)}
            className="rounded-full px-3.5 py-1.5 flex-shrink-0 transition-all"
            style={{
              background: muscleFilter === g ? "var(--primary)" : "var(--secondary)",
              color: muscleFilter === g ? "var(--primary-foreground)" : "var(--muted-foreground)",
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

      {/* Sessions Grouped by Month */}
      <div className="flex flex-col gap-6 px-5">
        {Object.entries(grouped).map(([month, sessions]) => (
          <div key={month}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              {month}
            </p>
            <div className="flex flex-col gap-3">
              {sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  settings={settings}
                  onRepeat={() => onRepeatWorkout(s)}
                  onDelete={() => {
                    if (confirm(`Delete session "${s.name}" from history?`)) {
                      onDeleteSession(s.id);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No workouts found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or muscle filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
