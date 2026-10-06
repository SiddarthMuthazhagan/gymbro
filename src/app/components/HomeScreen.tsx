import { Flame, Trophy, Zap, TrendingUp, ChevronRight, Settings, Play, Dumbbell } from "lucide-react";
import { WorkoutSession, Screen, UserSettings } from "./types";
import { calcStreak, formatWeight } from "../utils/calculations";

interface Props {
  history: WorkoutSession[];
  settings: UserSettings;
  onNavigate: (s: Screen) => void;
  onStartWorkout: (templateSession?: WorkoutSession) => void;
}

const muscleColors: Record<string, string> = {
  Chest: "#FF5C00",
  Back: "#C6FF00",
  Shoulders: "#00D4FF",
  Arms: "#A855F7",
  Legs: "#FFD60A",
  Core: "#FF3B30",
  Cardio: "#00FF88",
  "Full Body": "#FF69B4",
};

function daysSince(dateStr: string) {
  const today = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (isNaN(diff) || diff < 0) return "Recently";
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen({ history, settings, onNavigate, onStartWorkout }: Props) {
  const streak = calcStreak(history);
  const totalSessions = history.length;
  const totalVolume = history.reduce((a, s) => a + s.totalVolume, 0);
  const recent = history.slice(0, 3);
  const lastSession = history[0];

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Top Bar Header */}
      <div className="pt-12 px-5 flex justify-between items-start">
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted-foreground)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {todayDateStr}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontWeight: 800,
              color: "var(--foreground)",
              lineHeight: 1.1,
              marginTop: 4,
            }}
          >
            {getGreeting()},<br />
            <span style={{ color: "var(--primary)" }}>Crush It Today.</span>
          </h1>
        </div>

        <button
          onClick={() => onNavigate("settings")}
          className="rounded-2xl p-3 transition-all hover:bg-white/5 active:scale-95"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          title="Settings"
        >
          <Settings size={20} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Streak / Stats Row */}
      <div className="grid grid-cols-3 gap-3 px-5">
        {[
          { icon: <Flame size={18} />, label: "Streak", value: `${streak}d`, color: "#FF5C00" },
          { icon: <Trophy size={18} />, label: "Sessions", value: totalSessions, color: "#C6FF00" },
          {
            icon: <Zap size={18} />,
            label: "Volume",
            value: settings.unit === "lbs" ? `${(totalVolume * 2.20462 / 1000).toFixed(1)}k` : `${(totalVolume / 1000).toFixed(1)}t`,
            color: "#00D4FF",
          },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col gap-2 transition-transform hover:scale-[1.02]"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div style={{ color }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--foreground)", lineHeight: 1 }}>
              {value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Start Workout CTA */}
      <div className="px-5">
        <button
          onClick={() => onStartWorkout()}
          className="w-full rounded-2xl py-5 flex items-center justify-between px-6 transition-all active:scale-95 shadow-xl"
          style={{ background: "var(--primary)", boxShadow: "0 10px 30px rgba(198,255,0,0.2)" }}
        >
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--primary-foreground)", letterSpacing: "0.02em" }}>
              START BLANK WORKOUT
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "rgba(13,13,16,0.7)", marginTop: 2 }}>
              {lastSession ? `Last workout: ${lastSession.name}` : "Log your sets & reps"}
            </p>
          </div>
          <div className="rounded-full p-3" style={{ background: "rgba(0,0,0,0.15)" }}>
            <Zap size={22} strokeWidth={2.5} style={{ color: "var(--primary-foreground)" }} />
          </div>
        </button>
      </div>

      {/* Quick Repeat Last Workout CTA */}
      {lastSession && lastSession.exercises.length > 0 && (
        <div className="px-5">
          <button
            onClick={() => onStartWorkout(lastSession)}
            className="w-full rounded-2xl p-4 flex items-center justify-between transition-all active:scale-95"
            style={{ background: "var(--card)", border: "1px border var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2.5" style={{ background: "rgba(0,212,255,0.12)" }}>
                <Play size={18} style={{ color: "#00D4FF" }} fill="#00D4FF" />
              </div>
              <div className="text-left">
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                  Repeat "{lastSession.name}"
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)" }}>
                  {lastSession.exercises.length} exercises pre-filled with previous weights
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      )}

      {/* Progress Teaser */}
      <div className="px-5">
        <button
          onClick={() => onNavigate("stats")}
          className="w-full rounded-2xl p-4 flex items-center justify-between transition-all active:scale-95"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2.5" style={{ background: "rgba(198,255,0,0.1)" }}>
              <TrendingUp size={20} style={{ color: "var(--primary)" }} />
            </div>
            <div className="text-left">
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>Analytics & 1RM Progress</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)" }}>Track overload & muscle focus</p>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Recent Workouts */}
      <div className="px-5">
        <div className="flex justify-between items-center mb-3">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.02em" }}>
            RECENT LOGS
          </h2>
          <button onClick={() => onNavigate("history")} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>
            See all
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {recent.map((session) => {
            const muscles = [...new Set(session.exercises.map((e) => e.muscleGroup))];
            return (
              <div
                key={session.id}
                className="rounded-2xl p-4 transition-all hover:border-white/20"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.02em" }}>
                      {session.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                      {daysSince(session.date)} · {session.durationMinutes}m · {session.exercises.length} exercises
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                    {formatWeight(session.totalVolume, settings.unit)}
                  </span>
                </div>
                {muscles.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {muscles.map((m) => (
                      <span
                        key={m}
                        className="rounded-full px-2.5 py-0.5"
                        style={{
                          background: `${muscleColors[m] ?? "#888"}22`,
                          color: muscleColors[m] ?? "#888",
                          fontFamily: "var(--font-body)",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
