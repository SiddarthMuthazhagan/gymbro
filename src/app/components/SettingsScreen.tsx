import { useState } from "react";
import { UserSettings, CustomExercise } from "./types";
import { exportAppData, importAppData, resetAppData } from "../utils/storage";
import { Trash2, Download, Upload, RefreshCw, Volume2, VolumeX, Shield, Check, Flame, Sliders } from "lucide-react";

interface Props {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  customExercises: CustomExercise[];
  onDeleteCustomExercise: (name: string) => void;
  onResetData: () => void;
}

const themeColors = [
  { name: "Volt Neon", hex: "#C6FF00" },
  { name: "Electric Cyan", hex: "#00D4FF" },
  { name: "Sunset Orange", hex: "#FF5C00" },
  { name: "Cyber Purple", hex: "#A855F7" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Emerald", hex: "#00FF88" },
];

export function SettingsScreen({
  settings,
  onUpdateSettings,
  customExercises,
  onDeleteCustomExercise,
  onResetData,
}: Props) {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleUnitChange = (unit: "kg" | "lbs") => {
    onUpdateSettings({ ...settings, unit });
  };

  const handleAutoTimerToggle = () => {
    onUpdateSettings({ ...settings, autoRestTimer: !settings.autoRestTimer });
  };

  const handleSoundToggle = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleDurationChange = (secs: number) => {
    onUpdateSettings({ ...settings, restTimerDuration: secs });
  };

  const handleExport = () => {
    const jsonStr = exportAppData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gymbro_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importAppData(content)) {
        setImportStatus("Import successful! Reloading...");
        setTimeout(() => {
          onResetData();
          setImportStatus(null);
        }, 1200);
      } else {
        setImportStatus("Failed to import invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="pt-12 px-5 pb-4">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--foreground)", letterSpacing: "0.02em" }}>
          SETTINGS
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
          App preferences & data management
        </p>
      </div>

      <div className="flex flex-col gap-6 px-5">
        {/* Units & Preferences */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--foreground)", marginBottom: 12 }}>
            UNITS & PREFERENCES
          </h2>

          <div className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>Weight Unit</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)" }}>Select Kilograms or Pounds</p>
            </div>
            <div className="flex rounded-xl p-1" style={{ background: "var(--secondary)" }}>
              {(["kg", "lbs"] as ("kg" | "lbs")[]).map((u) => (
                <button
                  key={u}
                  onClick={() => handleUnitChange(u)}
                  className="rounded-lg px-4 py-1.5 transition-all"
                  style={{
                    background: settings.unit === u ? "var(--primary)" : "transparent",
                    color: settings.unit === u ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>Sound Effects</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)" }}>Audio alerts for timer and achievements</p>
            </div>
            <button
              onClick={handleSoundToggle}
              className="rounded-xl p-2.5 transition-all"
              style={{ background: settings.soundEnabled ? "rgba(198,255,0,0.15)" : "var(--secondary)", color: settings.soundEnabled ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        {/* Rest Timer Settings */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--foreground)", marginBottom: 12 }}>
            REST TIMER PREFERENCES
          </h2>

          <div className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>Auto-Start Rest Timer</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)" }}>Starts timer when set is checked done</p>
            </div>
            <button
              onClick={handleAutoTimerToggle}
              className="w-12 h-7 rounded-full p-1 transition-colors relative"
              style={{ background: settings.autoRestTimer ? "var(--primary)" : "var(--secondary)" }}
            >
              <div
                className="w-5 h-5 rounded-full bg-black transition-transform"
                style={{ transform: settings.autoRestTimer ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>
          </div>

          <div className="pt-3">
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
              Default Rest Duration
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((secs) => (
                <button
                  key={secs}
                  onClick={() => handleDurationChange(secs)}
                  className="rounded-xl py-2 transition-all"
                  style={{
                    background: settings.restTimerDuration === secs ? "var(--primary)" : "var(--secondary)",
                    color: settings.restTimerDuration === secs ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Exercises Manager */}
        {customExercises.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--foreground)", marginBottom: 12 }}>
              CUSTOM EXERCISES ({customExercises.length})
            </h2>
            <div className="flex flex-col gap-2">
              {customExercises.map((ex) => (
                <div key={ex.name} className="flex justify-between items-center py-2 px-3 rounded-xl" style={{ background: "var(--secondary)" }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{ex.name}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-foreground)", marginLeft: 8 }}>
                      ({ex.muscleGroup})
                    </span>
                  </div>
                  <button onClick={() => onDeleteCustomExercise(ex.name)} className="rounded-full p-1.5 text-red-400 hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup & Restore */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--foreground)", marginBottom: 12 }}>
            BACKUP & RESTORE
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
            Export your workout history to JSON or restore from a previous backup file.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 transition-all active:scale-95"
              style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            >
              <Download size={16} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>Backup JSON</span>
            </button>

            <label
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 transition-all cursor-pointer active:scale-95"
              style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            >
              <Upload size={16} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>Restore JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {importStatus && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--primary)", marginTop: 10, textAlign: "center" }}>
              {importStatus}
            </p>
          )}
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.2)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#FF3B30", marginBottom: 6 }}>
            RESET DATA
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
            Reset history back to initial sample workout data.
          </p>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset all data back to initial sample workouts?")) {
                resetAppData();
                onResetData();
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 transition-all"
            style={{ background: "rgba(255,59,48,0.15)", color: "#FF3B30", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700 }}
          >
            <RefreshCw size={14} /> Reset App State
          </button>
        </div>
      </div>
    </div>
  );
}
