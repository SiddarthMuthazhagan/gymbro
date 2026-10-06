import { useState, useEffect } from "react";
import { BottomNav } from "./components/BottomNav";
import { HomeScreen } from "./components/HomeScreen";
import { WorkoutScreen } from "./components/WorkoutScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { StatsScreen } from "./components/StatsScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { Screen, WorkoutSession, UserSettings, CustomExercise } from "./components/types";
import {
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
  loadCustomExercises,
  saveCustomExercises,
} from "./utils/storage";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [history, setHistory] = useState<WorkoutSession[]>(() => loadHistory());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>(() => loadCustomExercises());
  const [templateSession, setTemplateSession] = useState<WorkoutSession | null>(null);

  // Sync to LocalStorage on state updates
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveCustomExercises(customExercises);
  }, [customExercises]);

  const handleSaveWorkout = (session: WorkoutSession) => {
    setHistory((prev) => [session, ...prev]);
    setTemplateSession(null);
    setScreen("home");
  };

  const handleStartWorkout = (template?: WorkoutSession) => {
    setTemplateSession(template || null);
    setScreen("workout");
  };

  const handleRepeatWorkout = (session: WorkoutSession) => {
    setTemplateSession(session);
    setScreen("workout");
  };

  const handleDeleteSession = (sessionId: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const handleCreateCustomExercise = (ex: CustomExercise) => {
    setCustomExercises((prev) => [...prev, ex]);
  };

  const handleDeleteCustomExercise = (name: string) => {
    setCustomExercises((prev) => prev.filter((c) => c.name !== name));
  };

  const handleResetData = () => {
    setHistory(loadHistory());
    setSettings(loadSettings());
    setCustomExercises(loadCustomExercises());
  };

  return (
    <div
      className="size-full flex flex-col relative overflow-hidden"
      style={{ background: "var(--background)", maxWidth: 480, margin: "0 auto", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}
    >
      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 80, scrollbarWidth: "none" }}
      >
        {screen === "home" && (
          <HomeScreen
            history={history}
            settings={settings}
            onNavigate={setScreen}
            onStartWorkout={handleStartWorkout}
          />
        )}
        {screen === "workout" && (
          <WorkoutScreen
            settings={settings}
            history={history}
            customExercises={customExercises}
            templateSession={templateSession}
            onSave={handleSaveWorkout}
            onCreateCustomExercise={handleCreateCustomExercise}
          />
        )}
        {screen === "history" && (
          <HistoryScreen
            history={history}
            settings={settings}
            onRepeatWorkout={handleRepeatWorkout}
            onDeleteSession={handleDeleteSession}
          />
        )}
        {screen === "stats" && (
          <StatsScreen history={history} settings={settings} />
        )}
        {screen === "settings" && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            customExercises={customExercises}
            onDeleteCustomExercise={handleDeleteCustomExercise}
            onResetData={handleResetData}
          />
        )}
      </div>

      <BottomNav active={screen} onChange={setScreen} />
    </div>
  );
}
