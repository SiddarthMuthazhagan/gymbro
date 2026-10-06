import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from "recharts";
import { WorkoutSession, UserSettings } from "./types";
import { calcOneRepMax, kgToLbs, formatWeight } from "../utils/calculations";
import { EXERCISE_LIBRARY } from "./data";
import { TrendingUp, Flame, Calendar, Dumbbell } from "lucide-react";

interface Props {
  history: WorkoutSession[];
  settings: UserSettings;
}

const muscleColors: Record<string, string> = {
  Chest: "#FF5C00", Back: "#C6FF00", Shoulders: "#00D4FF",
  Arms: "#A855F7", Legs: "#FFD60A", Core: "#FF3B30",
  Cardio: "#00FF88", "Full Body": "#FF69B4",
};

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
}

function VolumeTooltip({ active, payload, label, unit }: TooltipProps & { unit: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value ?? 0;
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "#1E1E25", border: "1px solid rgba(255,255,255,0.15)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
        {unit === "lbs" ? `${(val * 2.20462 / 1000).toFixed(1)}k lbs` : `${(val / 1000).toFixed(1)}t`}
      </p>
    </div>
  );
}

function DurationTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "#1E1E25", border: "1px solid rgba(255,255,255,0.15)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "#00D4FF" }}>
        {payload[0].value} min
      </p>
    </div>
  );
}

function OneRMTooltip({ active, payload, label, unit }: TooltipProps & { unit: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value ?? 0;
  const displayVal = unit === "lbs" ? kgToLbs(val) : val;
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "#1E1E25", border: "1px solid rgba(255,255,255,0.15)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "#FFD60A" }}>
        Est 1RM: {displayVal} {unit}
      </p>
    </div>
  );
}

export function StatsScreen({ history, settings }: Props) {
  const [selectedExercise, setSelectedExercise] = useState("Bench Press");

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));

  const volumeData = sorted.map((s) => ({
    date: shortDate(s.date),
    volume: s.totalVolume,
  }));

  const durationData = sorted.map((s) => ({
    date: shortDate(s.date),
    minutes: s.durationMinutes,
  }));

  // 1RM Progressive Overload Tracker for selected exercise
  const oneRMData: { date: string; max1RM: number }[] = [];
  sorted.forEach((session) => {
    let sessionBest1RM = 0;
    session.exercises.forEach((ex) => {
      if (ex.name.toLowerCase() === selectedExercise.toLowerCase()) {
        ex.sets.forEach((set) => {
          if (set.done && set.weight > 0 && set.reps > 0) {
            const est = calcOneRepMax(set.weight, set.reps);
            if (est > sessionBest1RM) sessionBest1RM = est;
          }
        });
      }
    });
    if (sessionBest1RM > 0) {
      oneRMData.push({ date: shortDate(session.date), max1RM: sessionBest1RM });
    }
  });

  // Muscle group frequency
  const muscleFreq: Record<string, number> = {};
  history.forEach((s) => {
    s.exercises.forEach((e) => {
      muscleFreq[e.muscleGroup] = (muscleFreq[e.muscleGroup] ?? 0) + 1;
    });
  });
  const muscleData = Object.entries(muscleFreq)
    .map(([muscle, count]) => ({ muscle, count }))
    .sort((a, b) => b.count - a.count);

  const totalVolume = history.reduce((a, s) => a + s.totalVolume, 0);
  const avgDuration = history.length ? Math.round(history.reduce((a, s) => a + s.durationMinutes, 0) / history.length) : 0;
  const totalSets = history.reduce((a, s) => a + s.exercises.reduce((b, e) => b + e.sets.length, 0), 0);

  // Available exercises list for dropdown
  const allExerciseNames = Array.from(
    new Set([...EXERCISE_LIBRARY.map((e) => e.name), ...history.flatMap((s) => s.exercises.map((e) => e.name))])
  ).sort();

  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="pt-12 px-5 pb-5">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--foreground)", letterSpacing: "0.02em" }}>
          ANALYTICS & PROGRESS
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
          Overload trends & performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-5">
        {[
          {
            label: "Total Volume",
            value: settings.unit === "lbs" ? `${(totalVolume * 2.20462 / 1000).toFixed(1)}k` : `${(totalVolume / 1000).toFixed(0)}t`,
            color: "var(--primary)",
          },
          { label: "Avg Duration", value: `${avgDuration}m`, color: "#00D4FF" },
          { label: "Total Sets", value: totalSets, color: "#A855F7" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* 1RM Progressive Overload Tracker */}
      <div className="mx-5 mb-5 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "#FFD60A" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Estimated 1RM Growth
            </span>
          </div>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="rounded-xl px-2 py-1 text-xs outline-none"
            style={{ background: "var(--secondary)", color: "var(--foreground)", fontFamily: "var(--font-body)", border: "1px solid var(--border)" }}
          >
            {allExerciseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {oneRMData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={oneRMData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: "#7A7A90", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#7A7A90", fontSize: 10, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${settings.unit === "lbs" ? kgToLbs(v) : v}${settings.unit}`}
              />
              <Tooltip content={<OneRMTooltip unit={settings.unit} />} />
              <Line type="monotone" dataKey="max1RM" stroke="#FFD60A" strokeWidth={2.5} dot={{ fill: "#FFD60A", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-8 text-center text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
            No completed sets logged for {selectedExercise} yet.
          </div>
        )}
      </div>

      {/* Volume Chart */}
      <div className="mx-5 mb-5 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Volume per Session
        </p>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6FF00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C6FF00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#7A7A90", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#7A7A90", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (settings.unit === "lbs" ? `${(v * 2.20462 / 1000).toFixed(0)}k` : `${(v / 1000).toFixed(0)}t`)}
            />
            <Tooltip content={<VolumeTooltip unit={settings.unit} />} />
            <Area type="monotone" dataKey="volume" stroke="#C6FF00" strokeWidth={2.5} fill="url(#volGrad)" dot={{ fill: "#C6FF00", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: "#C6FF00" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Duration Chart */}
      <div className="mx-5 mb-5 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Workout Duration (mins)
        </p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={durationData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={18}>
            <XAxis dataKey="date" tick={{ fill: "#7A7A90", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#7A7A90", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
            <Tooltip content={<DurationTooltip />} />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {durationData.map((_, i) => (
                <Cell key={i} fill={i === durationData.length - 1 ? "#00D4FF" : "rgba(0,212,255,0.35)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Muscle Group Focus */}
      {muscleData.length > 0 && (
        <div className="mx-5 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            Muscle Group Focus
          </p>
          {muscleData.map(({ muscle, count }) => {
            const max = muscleData[0].count;
            const pct = (count / max) * 100;
            const color = muscleColors[muscle] ?? "#888";
            return (
              <div key={muscle} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{muscle}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>{count} exercises</span>
                </div>
                <div className="rounded-full overflow-hidden h-2" style={{ background: "var(--secondary)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
