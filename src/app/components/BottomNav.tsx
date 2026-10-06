import { Home, Dumbbell, History, BarChart2, Settings } from "lucide-react";
import { Screen } from "./types";

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
}

const tabs: { id: Screen; label: string; Icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }> }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "workout", label: "Workout", Icon: Dumbbell },
  { id: "history", label: "History", Icon: History },
  { id: "stats", label: "Stats", Icon: BarChart2 },
  { id: "settings", label: "Settings", Icon: Settings },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-1 pb-safe"
      style={{
        background: "rgba(13,13,16,0.92)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        height: 64,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-1.5 transition-all duration-200 relative"
            style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            {isActive && (
              <span
                className="absolute top-0 w-8 h-0.5 rounded-full shadow-lg"
                style={{ background: "var(--primary)", boxShadow: "0 0 10px var(--primary)" }}
              />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
