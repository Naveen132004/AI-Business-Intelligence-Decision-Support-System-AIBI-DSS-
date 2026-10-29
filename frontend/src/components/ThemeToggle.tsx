import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface ThemeToggleProps {
  /** Compact icon-only button (sidebar collapsed / mobile header). */
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? "Light mode" : "Dark mode";

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        title={label}
        aria-label={label}
        className="p-2.5 rounded-md text-surface-400 hover:text-fg hover:bg-surface-800 transition-colors"
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
                 text-surface-400 hover:text-fg hover:bg-surface-800 transition-colors"
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
