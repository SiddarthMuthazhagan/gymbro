import { useState, useEffect } from "react";
import { Play, Pause, Plus, Minus, X, Minimize2, Maximize2, BellRing } from "lucide-react";
import { sounds } from "../utils/audio";

interface Props {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
}

export function RestTimerModal({ initialSeconds, isOpen, onClose, soundEnabled = true }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    setIsRunning(true);
    setIsMinimized(false);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    if (secondsLeft <= 0) {
      if (soundEnabled) {
        sounds.playBeep();
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, secondsLeft, soundEnabled]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const adjustTime = (delta: number) => {
    setSecondsLeft((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > totalSeconds) setTotalSeconds(next);
      return next;
    });
  };

  const setPreset = (secs: number) => {
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(true);
  };

  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 100;
  const isFinished = secondsLeft === 0;

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-full px-4 py-2.5 shadow-2xl cursor-pointer transition-all animate-bounce"
        style={{
          background: isFinished ? "#FF3B30" : "var(--card)",
          border: `1px solid ${isFinished ? "#FF3B30" : "var(--primary)"}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
        onClick={() => setIsMinimized(false)}
      >
        <BellRing size={16} className={isFinished ? "animate-pulse" : ""} style={{ color: isFinished ? "#FFF" : "var(--primary)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: isFinished ? "#FFF" : "var(--foreground)" }}>
          {isFinished ? "REST UP!" : formatTime(secondsLeft)}
        </span>
        <Maximize2 size={14} style={{ color: isFinished ? "#FFF" : "var(--muted-foreground)" }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className="w-full max-w-xs rounded-3xl p-6 flex flex-col items-center relative overflow-hidden"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        }}
      >
        {/* Top Controls */}
        <div className="w-full flex justify-between items-center mb-4">
          <button
            onClick={() => setIsMinimized(true)}
            className="rounded-full p-2 transition-colors hover:bg-white/5"
            style={{ color: "var(--muted-foreground)" }}
            title="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>
            REST TIMER
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-white/5"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Circular Progress & Display */}
        <div className="relative w-44 h-44 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="var(--secondary)" strokeWidth="6" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke={isFinished ? "#FF3B30" : "var(--primary)"}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={263.89}
              strokeDashoffset={263.89 - (263.89 * Math.min(100, Math.max(0, progressPct))) / 100}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 38,
                fontWeight: 800,
                color: isFinished ? "#FF3B30" : "var(--foreground)",
                lineHeight: 1,
              }}
            >
              {formatTime(secondsLeft)}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
              {isFinished ? "Time to lift!" : isRunning ? "Resting..." : "Paused"}
            </span>
          </div>
        </div>

        {/* Adjust +/- Buttons */}
        <div className="flex items-center gap-4 my-4">
          <button
            onClick={() => adjustTime(-15)}
            className="rounded-2xl px-3 py-2 flex items-center gap-1 transition-all active:scale-95"
            style={{ background: "var(--secondary)", color: "var(--foreground)", fontFamily: "var(--font-mono)", fontSize: 13 }}
          >
            <Minus size={14} /> 15s
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="rounded-full w-12 h-12 flex items-center justify-center transition-all active:scale-95 shadow-lg"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          <button
            onClick={() => adjustTime(15)}
            className="rounded-2xl px-3 py-2 flex items-center gap-1 transition-all active:scale-95"
            style={{ background: "var(--secondary)", color: "var(--foreground)", fontFamily: "var(--font-mono)", fontSize: 13 }}
          >
            <Plus size={14} /> 15s
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-1.5 mt-2 w-full justify-center">
          {[30, 60, 90, 120, 180].map((presetSecs) => (
            <button
              key={presetSecs}
              onClick={() => setPreset(presetSecs)}
              className="rounded-xl px-2.5 py-1.5 transition-all flex-1"
              style={{
                background: totalSeconds === presetSecs ? "rgba(198,255,0,0.15)" : "var(--secondary)",
                color: totalSeconds === presetSecs ? "var(--primary)" : "var(--muted-foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                border: totalSeconds === presetSecs ? "1px solid var(--primary)" : "1px solid transparent",
              }}
            >
              {presetSecs >= 60 ? `${presetSecs / 60}m` : `${presetSecs}s`}
            </button>
          ))}
        </div>

        {/* Done / Skip button */}
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl py-3 transition-all active:scale-95"
          style={{ background: "var(--secondary)", color: "var(--foreground)", fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}
        >
          {isFinished ? "NEXT SET" : "SKIP REST"}
        </button>
      </div>
    </div>
  );
}
